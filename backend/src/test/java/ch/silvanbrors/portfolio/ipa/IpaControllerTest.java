package ch.silvanbrors.portfolio.ipa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.silvanbrors.portfolio.IntegrationTest;
import ch.silvanbrors.portfolio.ipa.IpaAssistantClient.Failure;
import ch.silvanbrors.portfolio.ipa.IpaAssistantClient.IpaException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@IntegrationTest
@TestPropertySource(
    properties = {
      "app.ipa.per-minute=2",
      "app.cors.allowed-origins=https://silvanbrors.ch"
    })
class IpaControllerTest {

  /** Every test gets its own visitor IP, so the rate limit of one test does not hit the next. */
  private static final AtomicInteger NEXT_IP = new AtomicInteger(1);

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcClient jdbc;
  @MockitoBean private IpaAssistantClient assistant;

  private String ip;

  @BeforeEach
  void setUp() {
    jdbc.sql("delete from ipa_question").update();
    ip = "192.0.2." + NEXT_IP.getAndIncrement();
    when(assistant.configured()).thenReturn(true);
  }

  private ResultActions ask(String json) throws Exception {
    return mockMvc.perform(
        post("/api/ipa/ask")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json)
            .with(
                request -> {
                  request.setRemoteAddr(ip);
                  return request;
                }));
  }

  private static String question(String text) {
    return "{\"frage\":\"" + text + "\"}";
  }

  private int answered() {
    return jdbc.sql("select count(*) from ipa_question").query(Integer.class).single();
  }

  @Test
  void passesTheAnswerAndSourcesThrough() throws Exception {
    when(assistant.ask("Was heisst IPERKA?"))
        .thenReturn(
            new IpaAnswer(
                "Informieren, Planen, …",
                List.of(new IpaAnswer.Source("1.1 – IPERKA & Projektmethodik.md", "IPERKA", 0.9))));

    ask(question("  Was heisst IPERKA?  "))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.antwort").value("Informieren, Planen, …"))
        .andExpect(jsonPath("$.quellen[0].datei").value("1.1 – IPERKA & Projektmethodik.md"))
        .andExpect(jsonPath("$.quellen[0].abschnitt").value("IPERKA"));
    assertThat(answered()).isEqualTo(1);
  }

  @Test
  void rejectsTooShortOrTooLongQuestions() throws Exception {
    ask(question("hi")).andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fehler").value("Die Frage muss 3 bis 300 Zeichen lang sein."));
    ask(question("x".repeat(301))).andExpect(status().isBadRequest());
    ask("{}").andExpect(status().isBadRequest());
    ask("kein json").andExpect(status().isBadRequest());
    verify(assistant, never()).ask(anyString());
  }

  @Test
  void offlineWithoutUsingTheLimit() throws Exception {
    when(assistant.configured()).thenReturn(false);
    for (int i = 0; i < 3; i++) {
      ask(question("Was ist Docker?"))
          .andExpect(status().isServiceUnavailable())
          .andExpect(jsonPath("$.fehler").value("Der Assistent ist gerade offline."));
    }
    verify(assistant, never()).ask(anyString());
  }

  @Test
  void rateLimitsPerVisitor() throws Exception {
    when(assistant.ask(anyString())).thenReturn(new IpaAnswer("Antwort", List.of()));
    ask(question("Frage eins")).andExpect(status().isOk());
    ask(question("Frage zwei")).andExpect(status().isOk());

    ask(question("Frage drei"))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists(HttpHeaders.RETRY_AFTER))
        .andExpect(jsonPath("$.fehler").value("Zu viele Fragen. Bitte versuch es später nochmals."));
    assertThat(answered()).isEqualTo(2);
  }

  @Test
  void mapsFailuresToClearMessages() throws Exception {
    when(assistant.ask("Nicht erreichbar?")).thenThrow(new IpaException(Failure.UNAVAILABLE, null));
    when(assistant.ask("Zu langsam?")).thenThrow(new IpaException(Failure.TIMEOUT, null));

    ask(question("Nicht erreichbar?"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(jsonPath("$.fehler").value("Der Assistent ist gerade nicht erreichbar."));
    ask(question("Zu langsam?"))
        .andExpect(status().isGatewayTimeout())
        .andExpect(
            jsonPath("$.fehler").value("Der Assistent hat zu lange gebraucht. Versuch es nochmals."));
    assertThat(answered()).isZero();
  }

  @Test
  void browsersMayPostOnlyToTheIpaChat() throws Exception {
    mockMvc
        .perform(
            options("/api/ipa/ask")
                .header(HttpHeaders.ORIGIN, "https://silvanbrors.ch")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "POST"));

    mockMvc
        .perform(
            options("/api/clipper/events")
                .header(HttpHeaders.ORIGIN, "https://silvanbrors.ch")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
        .andExpect(status().isForbidden());
  }
}

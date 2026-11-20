package ch.silvanbrors.portfolio.agents;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.silvanbrors.portfolio.IntegrationTest;
import ch.silvanbrors.portfolio.config.ApiKeyFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@IntegrationTest
class AgentsReportControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcClient jdbc;

  @BeforeEach
  void clean() {
    jdbc.sql("delete from agents_report").update();
  }

  private static String report(String week) {
    return """
        {
          "meta": "Analyse-Agent · automatisch erstellt",
          "week": "%s",
          "title": "Wochenbericht Marketing",
          "intro": "Was diese Woche funktioniert hat.",
          "channels": [
            {"name": "TikTok", "barWidth": 80, "highlight": true, "views": "1.2k"},
            {"name": "Reddit", "barWidth": 30, "views": "400"}
          ],
          "recommendation": "Mehr Clips auf TikTok.",
          "note": "Automatisch erstellt."
        }
        """
        .formatted(week);
  }

  private ResultActions publish(String body, String key) throws Exception {
    MockHttpServletRequestBuilder request =
        post("/api/agents/report").contentType(MediaType.APPLICATION_JSON).content(body);
    if (key != null) request.header(ApiKeyFilter.HEADER, key);
    return mockMvc.perform(request);
  }

  @Test
  void returns404WhileThereIsNoReport() throws Exception {
    mockMvc.perform(get("/api/agents/report")).andExpect(status().isNotFound());
  }

  @Test
  void storesAndReturnsTheNewestReport() throws Exception {
    publish(report("KW 46"), IntegrationTest.AGENTS_KEY).andExpect(status().isCreated());
    publish(report("KW 47"), IntegrationTest.AGENTS_KEY).andExpect(status().isCreated());

    mockMvc
        .perform(get("/api/agents/report"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.week").value("KW 47"))
        .andExpect(jsonPath("$.channels[0].name").value("TikTok"))
        .andExpect(jsonPath("$.channels[0].highlight").value(true))
        .andExpect(jsonPath("$.channels[1].barWidth").value(30))
        .andExpect(jsonPath("$.channels[1].highlight").doesNotExist());
  }

  @Test
  void needsTheAgentsKey() throws Exception {
    publish(report("KW 47"), null).andExpect(status().isUnauthorized());
    publish(report("KW 47"), IntegrationTest.CLIPPER_KEY).andExpect(status().isUnauthorized());
    assertThat(count()).isZero();
  }

  @Test
  void rejectsInvalidReports() throws Exception {
    String key = IntegrationTest.AGENTS_KEY;
    publish(report("KW 47").replace("\"title\": \"Wochenbericht Marketing\",", ""), key)
        .andExpect(status().isBadRequest());
    publish(report("KW 47").replace("\"barWidth\": 80", "\"barWidth\": 150"), key)
        .andExpect(status().isBadRequest());
    publish(report("x".repeat(51)), key).andExpect(status().isBadRequest());
    publish("{}", key).andExpect(status().isBadRequest());
    assertThat(count()).isZero();
  }

  private int count() {
    return jdbc.sql("select count(*) from agents_report").query(Integer.class).single();
  }
}

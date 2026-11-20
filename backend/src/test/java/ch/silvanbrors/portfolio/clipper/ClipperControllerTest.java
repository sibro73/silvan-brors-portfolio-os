package ch.silvanbrors.portfolio.clipper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.silvanbrors.portfolio.IntegrationTest;
import ch.silvanbrors.portfolio.config.ApiKeyFilter;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@IntegrationTest
class ClipperControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcClient jdbc;
  @Autowired private ClipRepository clips;

  @BeforeEach
  void clean() {
    jdbc.sql("delete from clip_event").update();
  }

  private ResultActions send(String body, String key) throws Exception {
    MockHttpServletRequestBuilder request =
        post("/api/clipper/events").contentType(MediaType.APPLICATION_JSON).content(body);
    if (key != null) request.header(ApiKeyFilter.HEADER, key);
    return mockMvc.perform(request);
  }

  private static String event(String id, Instant createdAt) {
    return "{\"clipId\":\"%s\",\"createdAt\":\"%s\"}".formatted(id, createdAt);
  }

  private int stored() {
    return jdbc.sql("select count(*) from clip_event").query(Integer.class).single();
  }

  @Test
  void storesANewClip() throws Exception {
    send(event("clip-1", Instant.now()), IntegrationTest.CLIPPER_KEY)
        .andExpect(status().isCreated());
    assertThat(stored()).isEqualTo(1);
  }

  @Test
  void countsTheSameClipOnlyOnce() throws Exception {
    String body = event("clip-1", Instant.now());
    send(body, IntegrationTest.CLIPPER_KEY).andExpect(status().isCreated());
    send(body, IntegrationTest.CLIPPER_KEY).andExpect(status().isOk());
    assertThat(stored()).isEqualTo(1);
  }

  @Test
  void needsTheClipperKey() throws Exception {
    send(event("clip-1", Instant.now()), null).andExpect(status().isUnauthorized());
    send(event("clip-1", Instant.now()), IntegrationTest.AGENTS_KEY)
        .andExpect(status().isUnauthorized());
    assertThat(stored()).isZero();
  }

  @Test
  void rejectsInvalidData() throws Exception {
    String key = IntegrationTest.CLIPPER_KEY;
    send("{\"createdAt\":\"2026-11-20T10:00:00Z\"}", key).andExpect(status().isBadRequest());
    send("{\"clipId\":\"clip-1\"}", key).andExpect(status().isBadRequest());
    send(event("clip 1; drop", Instant.now()), key).andExpect(status().isBadRequest());
    send(event("x".repeat(101), Instant.now()), key).andExpect(status().isBadRequest());
    send("{\"clipId\":\"clip-1\",\"createdAt\":\"gestern\"}", key)
        .andExpect(status().isBadRequest());
    send("kein json", key).andExpect(status().isBadRequest());
    assertThat(stored()).isZero();
  }

  @Test
  void rejectsClipsFromTheFuture() throws Exception {
    send(event("clip-1", Instant.now().plus(1, ChronoUnit.HOURS)), IntegrationTest.CLIPPER_KEY)
        .andExpect(status().isBadRequest());
    assertThat(stored()).isZero();
  }

  @Test
  void countsByTimeRange() {
    Instant t = Instant.parse("2026-11-20T10:00:00Z");
    clips.insertIfAbsent("a", t.minusSeconds(1));
    clips.insertIfAbsent("b", t);
    clips.insertIfAbsent("c", t.plusSeconds(3599));
    clips.insertIfAbsent("d", t.plusSeconds(3600));
    assertThat(clips.countCreatedBetween(t, t.plusSeconds(3600))).isEqualTo(2);
  }
}

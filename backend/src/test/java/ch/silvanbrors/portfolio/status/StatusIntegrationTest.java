package ch.silvanbrors.portfolio.status;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.silvanbrors.portfolio.IntegrationTest;
import ch.silvanbrors.portfolio.agents.AgentsReport;
import ch.silvanbrors.portfolio.agents.AgentsReportRepository;
import ch.silvanbrors.portfolio.clipper.ClipRepository;
import ch.silvanbrors.portfolio.config.ClockConfig;
import ch.silvanbrors.portfolio.ipa.IpaQuestionRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
class StatusIntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcClient jdbc;
  @Autowired private ClipRepository clips;
  @Autowired private AgentsReportRepository reports;
  @Autowired private IpaQuestionRepository ipaQuestions;

  @BeforeEach
  void clean() {
    jdbc.sql("delete from clip_event").update();
    jdbc.sql("delete from agents_report").update();
    jdbc.sql("delete from ipa_question").update();
  }

  @Test
  void nullsOnAnEmptyDatabase() throws Exception {
    mockMvc
        .perform(get("/api/status"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.clipsHeute").value((Object) null))
        .andExpect(jsonPath("$.letzterBericht").value((Object) null))
        .andExpect(jsonPath("$.ipaFragen").value((Object) null));
  }

  @Test
  void liveNumbersFromTheDatabase() throws Exception {
    ipaQuestions.recordAnswered();
    ipaQuestions.recordAnswered();
    clips.insertIfAbsent("today", Instant.now());
    clips.insertIfAbsent("last-week", Instant.now().minusSeconds(7 * 24 * 3600));
    reports.save(
        new AgentsReport(
            "meta",
            "KW 47",
            "Titel",
            "Intro",
            List.of(new AgentsReport.Channel("TikTok", 80, true, "1k")),
            "Empfehlung",
            null));

    mockMvc
        .perform(get("/api/status"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.clipsHeute").value(1))
        .andExpect(jsonPath("$.letzterBericht").value(LocalDate.now(ClockConfig.ZONE).toString()))
        .andExpect(jsonPath("$.ipaFragen").value(2))
        .andExpect(jsonPath("$.wishlists").value((Object) null));
  }
}

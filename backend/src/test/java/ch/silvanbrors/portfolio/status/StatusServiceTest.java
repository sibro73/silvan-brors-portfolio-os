package ch.silvanbrors.portfolio.status;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.silvanbrors.portfolio.agents.AgentsReportRepository;
import ch.silvanbrors.portfolio.clipper.ClipRepository;
import ch.silvanbrors.portfolio.ipa.IpaQuestionRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;

class StatusServiceTest {

  private final ClipRepository clips = mock(ClipRepository.class);
  private final AgentsReportRepository reports = mock(AgentsReportRepository.class);
  private final IpaQuestionRepository ipaQuestions = mock(IpaQuestionRepository.class);

  /** 20.11.2026, 23:30 in Zurich (22:30 UTC). */
  private final Clock clock = Clock.fixed(Instant.parse("2026-11-20T22:30:00Z"), ZoneOffset.UTC);

  private final StatusService service = new StatusService(clips, reports, ipaQuestions, clock);

  @Test
  void reportsNothingWhileNoSourceHasSentData() {
    when(clips.any()).thenReturn(false);
    when(reports.latestReceivedAt()).thenReturn(Optional.empty());

    assertThat(service.currentStatus()).isEqualTo(StatusResponse.unavailable());
  }

  @Test
  void countsTodaysClipsInZurichTime() {
    when(clips.any()).thenReturn(true);
    when(clips.countCreatedBetween(any(), any())).thenReturn(4);
    when(reports.latestReceivedAt()).thenReturn(Optional.empty());

    assertThat(service.currentStatus().clipsHeute()).isEqualTo(4);
    // Midnight to midnight in Zurich (UTC+1 in November), not in UTC
    verify(clips)
        .countCreatedBetween(
            Instant.parse("2026-11-19T23:00:00Z"), Instant.parse("2026-11-20T23:00:00Z"));
  }

  @Test
  void zeroIsRealOnceTheClipperHasReported() {
    when(clips.any()).thenReturn(true);
    when(clips.countCreatedBetween(any(), any())).thenReturn(0);
    when(reports.latestReceivedAt()).thenReturn(Optional.empty());

    assertThat(service.currentStatus().clipsHeute()).isZero();
  }

  @Test
  void dateOfTheLastReportInZurichTime() {
    when(clips.any()).thenReturn(false);
    // 23:15 UTC is already the next day in Zurich
    when(reports.latestReceivedAt())
        .thenReturn(Optional.of(Instant.parse("2026-11-16T23:15:00Z")));

    assertThat(service.currentStatus().letzterBericht()).isEqualTo(LocalDate.of(2026, 11, 17));
  }

  @Test
  void answersWithoutDatabase() {
    when(clips.any()).thenThrow(new DataAccessResourceFailureException("connection refused"));

    StatusResponse status = service.currentStatus();

    assertThat(status).isEqualTo(StatusResponse.unavailable());
  }

  @Test
  void countsAnsweredIpaQuestionsOnceThereAreAny() {
    when(clips.any()).thenReturn(false);
    when(reports.latestReceivedAt()).thenReturn(Optional.empty());

    when(ipaQuestions.countAnswered()).thenReturn(0);
    assertThat(service.currentStatus().ipaFragen()).isNull();

    when(ipaQuestions.countAnswered()).thenReturn(37);
    assertThat(service.currentStatus().ipaFragen()).isEqualTo(37);
  }

  @Test
  void steamIsNotConnectedYet() {
    when(clips.any()).thenReturn(true);
    when(reports.latestReceivedAt()).thenReturn(Optional.of(Instant.now()));
    when(ipaQuestions.countAnswered()).thenReturn(3);

    assertThat(service.currentStatus().wishlists()).isNull();
  }
}

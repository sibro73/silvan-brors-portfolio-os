package ch.silvanbrors.portfolio.status;

import ch.silvanbrors.portfolio.agents.AgentsReportRepository;
import ch.silvanbrors.portfolio.clipper.ClipRepository;
import ch.silvanbrors.portfolio.config.ClockConfig;
import ch.silvanbrors.portfolio.ipa.IpaQuestionRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

/**
 * Collects the live numbers from the database. External sources are never queried per request:
 * the Clipper and the agents push their data, and the result is cached briefly.
 *
 * <p>{@code null} means "no data yet" and makes the frontend show its placeholder. Wishlists
 * (Steam) are not connected yet.
 */
@Service
public class StatusService {

  public static final String CACHE = "status";

  private static final Logger log = LoggerFactory.getLogger(StatusService.class);

  private final ClipRepository clips;
  private final AgentsReportRepository reports;
  private final IpaQuestionRepository ipaQuestions;
  private final Clock clock;

  public StatusService(
      ClipRepository clips,
      AgentsReportRepository reports,
      IpaQuestionRepository ipaQuestions,
      Clock clock) {
    this.clips = clips;
    this.reports = reports;
    this.ipaQuestions = ipaQuestions;
    this.clock = clock;
  }

  @Cacheable(CACHE)
  public StatusResponse currentStatus() {
    try {
      return new StatusResponse(null, clipsToday(), ipaQuestionsAnswered(), lastReportDate());
    } catch (DataAccessException e) {
      // The page must keep working without a database: answer with "no data".
      log.warn("Status without database: {}", e.getMessage());
      return StatusResponse.unavailable();
    }
  }

  /** Clips since midnight in Zurich, or {@code null} while the Clipper never reported. */
  private Integer clipsToday() {
    if (!clips.any()) return null;
    LocalDate today = LocalDate.now(clock.withZone(ClockConfig.ZONE));
    Instant from = today.atStartOfDay(ClockConfig.ZONE).toInstant();
    Instant to = today.plusDays(1).atStartOfDay(ClockConfig.ZONE).toInstant();
    return clips.countCreatedBetween(from, to);
  }

  /** All answered questions so far, or {@code null} while there was none. */
  private Integer ipaQuestionsAnswered() {
    int count = ipaQuestions.countAnswered();
    return count == 0 ? null : count;
  }

  private LocalDate lastReportDate() {
    return reports
        .latestReceivedAt()
        .map(at -> LocalDate.ofInstant(at, ClockConfig.ZONE))
        .orElse(null);
  }
}

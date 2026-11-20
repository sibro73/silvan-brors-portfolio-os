package ch.silvanbrors.portfolio.ipa;

import ch.silvanbrors.portfolio.ipa.IpaAssistantClient.IpaException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public entry for the IPA chat. Guards the separate ipa-assistant: length limit, rate limit and
 * timeout, then passes the question on. Error texts are German, the chat shows them as they are.
 */
@RestController
@RequestMapping("/api/ipa")
public class IpaController {

  static final int MIN_LENGTH = 3;
  static final int MAX_LENGTH = 300;

  /** Request body. */
  public record AskRequest(String frage) {}

  /** Error body, shown in the chat. */
  public record ErrorResponse(String fehler) {}

  private final IpaAssistantClient assistant;
  private final IpaRateLimiter limiter;
  private final ClientIpResolver clientIp;
  private final IpaQuestionRepository questions;

  public IpaController(
      IpaAssistantClient assistant,
      IpaRateLimiter limiter,
      ClientIpResolver clientIp,
      IpaQuestionRepository questions) {
    this.assistant = assistant;
    this.limiter = limiter;
    this.clientIp = clientIp;
    this.questions = questions;
  }

  @PostMapping("/ask")
  public ResponseEntity<?> ask(@RequestBody AskRequest body, HttpServletRequest request) {
    String question = body == null || body.frage() == null ? "" : body.frage().strip();
    if (question.length() < MIN_LENGTH || question.length() > MAX_LENGTH) {
      return error(
          HttpStatus.BAD_REQUEST,
          "Die Frage muss %d bis %d Zeichen lang sein.".formatted(MIN_LENGTH, MAX_LENGTH));
    }
    // Offline: answer at once, without using up anybody's limit
    if (!assistant.configured()) {
      return error(HttpStatus.SERVICE_UNAVAILABLE, "Der Assistent ist gerade offline.");
    }

    IpaRateLimiter.Decision decision = limiter.tryAcquire(clientIp.resolve(request));
    if (!decision.allowed()) {
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .header(HttpHeaders.RETRY_AFTER, Long.toString(decision.retryAfterSeconds()))
          .body(new ErrorResponse("Zu viele Fragen. Bitte versuch es später nochmals."));
    }

    try {
      IpaAnswer answer = assistant.ask(question);
      questions.recordAnswered();
      return ResponseEntity.ok(answer);
    } catch (IpaException e) {
      return switch (e.failure()) {
        case OFFLINE -> error(HttpStatus.SERVICE_UNAVAILABLE, "Der Assistent ist gerade offline.");
        case UNAVAILABLE ->
            error(HttpStatus.SERVICE_UNAVAILABLE, "Der Assistent ist gerade nicht erreichbar.");
        case TIMEOUT ->
            error(
                HttpStatus.GATEWAY_TIMEOUT,
                "Der Assistent hat zu lange gebraucht. Versuch es nochmals.");
      };
    }
  }

  private static ResponseEntity<ErrorResponse> error(HttpStatus status, String message) {
    return ResponseEntity.status(status).body(new ErrorResponse(message));
  }
}

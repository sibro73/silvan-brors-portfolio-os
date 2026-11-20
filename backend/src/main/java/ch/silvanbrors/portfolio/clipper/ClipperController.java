package ch.silvanbrors.portfolio.clipper;

import jakarta.validation.Valid;
import java.time.Clock;
import java.time.Duration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The Clipper reports cut clips here. Protected by {@code X-Api-Key} (see ApiKeyFilter). */
@RestController
@RequestMapping("/api/clipper")
public class ClipperController {

  /** Tolerance for clocks that run slightly ahead. */
  static final Duration MAX_CLOCK_SKEW = Duration.ofMinutes(5);

  private final ClipRepository clips;
  private final Clock clock;

  public ClipperController(ClipRepository clips, Clock clock) {
    this.clips = clips;
    this.clock = clock;
  }

  /** 201 for a new clip, 200 if the clip was already known, 400 for invalid data. */
  @PostMapping("/events")
  public ResponseEntity<Void> report(@Valid @RequestBody ClipEventRequest event) {
    if (event.createdAt().isAfter(clock.instant().plus(MAX_CLOCK_SKEW))) {
      return ResponseEntity.badRequest().build();
    }
    boolean created = clips.insertIfAbsent(event.clipId(), event.createdAt());
    return ResponseEntity.status(created ? HttpStatus.CREATED : HttpStatus.OK).build();
  }
}

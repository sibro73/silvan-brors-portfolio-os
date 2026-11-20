package ch.silvanbrors.portfolio.ipa;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import java.time.Duration;
import org.springframework.stereotype.Component;

/**
 * Limits questions per IP (per minute and per day) and for all visitors together (per day), so
 * nobody can flood the machine that runs the LLM. In memory: fine for a single backend instance.
 */
@Component
public class IpaRateLimiter {

  /** Result of a check. {@code retryAfterSeconds} is only set when the question is refused. */
  public record Decision(boolean allowed, long retryAfterSeconds) {
    static final Decision ALLOWED = new Decision(true, 0);
  }

  private static final int MAX_TRACKED_IPS = 10_000;

  private final IpaProperties properties;
  private final Bucket global;
  private final Cache<String, Bucket> perIp =
      Caffeine.newBuilder()
          .maximumSize(MAX_TRACKED_IPS)
          .expireAfterAccess(Duration.ofDays(1))
          .build();

  public IpaRateLimiter(IpaProperties properties) {
    this.properties = properties;
    this.global =
        Bucket.builder()
            .addLimit(
                limit ->
                    limit
                        .capacity(properties.globalPerDay())
                        .refillIntervally(properties.globalPerDay(), Duration.ofDays(1)))
            .build();
  }

  /** Counts one question for {@code clientIp}, if it is still allowed. */
  public Decision tryAcquire(String clientIp) {
    Bucket bucket = perIp.get(clientIp, ip -> newIpBucket());
    ConsumptionProbe own = bucket.tryConsumeAndReturnRemaining(1);
    if (!own.isConsumed()) return refused(own);
    ConsumptionProbe all = global.tryConsumeAndReturnRemaining(1);
    if (!all.isConsumed()) return refused(all);
    return Decision.ALLOWED;
  }

  private Bucket newIpBucket() {
    return Bucket.builder()
        .addLimit(
            limit ->
                limit
                    .capacity(properties.perMinute())
                    .refillGreedy(properties.perMinute(), Duration.ofMinutes(1)))
        .addLimit(
            limit ->
                limit
                    .capacity(properties.perDay())
                    .refillIntervally(properties.perDay(), Duration.ofDays(1)))
        .build();
  }

  private static Decision refused(ConsumptionProbe probe) {
    long seconds = Duration.ofNanos(probe.getNanosToWaitForRefill()).toSeconds();
    return new Decision(false, Math.max(1, seconds));
  }
}

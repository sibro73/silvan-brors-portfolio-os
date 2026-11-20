package ch.silvanbrors.portfolio.ipa;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Connection to the separate ipa-assistant project (RAG over the IPA notes).
 *
 * @param url base URL of ipa-assistant; empty = assistant offline
 * @param timeout how long to wait for an answer (the local LLM is slow on a CPU)
 * @param accessClientId optional Cloudflare Access service token (when exposed via a tunnel)
 * @param accessClientSecret secret of that service token
 * @param perMinute questions per IP and minute
 * @param perDay questions per IP and day
 * @param globalPerDay questions per day for all visitors together
 * @param trustFlyClientIp read the client IP from {@code Fly-Client-IP} (only behind the Fly proxy)
 */
@ConfigurationProperties(prefix = "app.ipa")
public record IpaProperties(
    String url,
    @DefaultValue("30s") Duration timeout,
    String accessClientId,
    String accessClientSecret,
    @DefaultValue("5") int perMinute,
    @DefaultValue("30") int perDay,
    @DefaultValue("200") int globalPerDay,
    @DefaultValue("false") boolean trustFlyClientIp) {

  public boolean configured() {
    return url != null && !url.isBlank();
  }
}

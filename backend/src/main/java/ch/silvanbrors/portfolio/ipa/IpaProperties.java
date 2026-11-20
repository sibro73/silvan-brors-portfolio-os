package ch.silvanbrors.portfolio.ipa;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Connection to the separate ipa-assistant project (RAG over the IPA notes). It is not public: in
 * production the URL stays empty and the chat shows example answers; locally it can be set.
 *
 * @param url base URL of ipa-assistant; empty = assistant offline
 * @param timeout how long to wait for an answer (the local LLM is slow on a CPU)
 * @param perMinute questions per IP and minute
 * @param perDay questions per IP and day
 * @param globalPerDay questions per day for all visitors together
 * @param trustFlyClientIp read the client IP from {@code Fly-Client-IP} (only behind the Fly proxy)
 */
@ConfigurationProperties(prefix = "app.ipa")
public record IpaProperties(
    String url,
    @DefaultValue("30s") Duration timeout,
    @DefaultValue("5") int perMinute,
    @DefaultValue("30") int perDay,
    @DefaultValue("200") int globalPerDay,
    @DefaultValue("false") boolean trustFlyClientIp) {

  public boolean configured() {
    return url != null && !url.isBlank();
  }
}

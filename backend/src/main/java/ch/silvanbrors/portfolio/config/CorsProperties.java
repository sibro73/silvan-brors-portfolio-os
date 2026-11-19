package ch.silvanbrors.portfolio.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Origins that may call the public API from a browser. Set via {@code FRONTEND_ORIGIN}
 * (comma-separated), e.g. {@code https://silvanbrors.ch,http://localhost:5173}.
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {

  public CorsProperties {
    allowedOrigins =
        allowedOrigins == null
            ? List.of()
            : allowedOrigins.stream().map(String::strip).filter(o -> !o.isEmpty()).toList();
  }
}

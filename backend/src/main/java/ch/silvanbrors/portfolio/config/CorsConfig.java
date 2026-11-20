package ch.silvanbrors.portfolio.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Lets the frontend (a different origin) read the public API. */
@Configuration
@EnableConfigurationProperties(CorsProperties.class)
public class CorsConfig implements WebMvcConfigurer {

  private final CorsProperties properties;

  public CorsConfig(CorsProperties properties) {
    this.properties = properties;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    String[] origins = properties.allowedOrigins().toArray(String[]::new);
    // The IPA chat is the only POST the browser may send (rate-limited). Registered first,
    // because the first matching pattern wins.
    registry
        .addMapping("/api/ipa/**")
        .allowedOrigins(origins)
        .allowedMethods("POST")
        .allowedHeaders("Content-Type")
        .allowCredentials(false)
        .maxAge(3600);
    // Everything else: read only. The write endpoints (Clipper, agents) are not for browsers.
    registry
        .addMapping("/api/**")
        .allowedOrigins(origins)
        .allowedMethods("GET")
        .allowCredentials(false)
        .maxAge(3600);
  }
}

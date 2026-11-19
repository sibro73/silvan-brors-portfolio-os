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
    registry
        .addMapping("/api/**")
        .allowedOrigins(properties.allowedOrigins().toArray(String[]::new))
        // POST endpoints follow in later phases and get their own rules (API key, rate limit).
        .allowedMethods("GET")
        .allowCredentials(false)
        .maxAge(3600);
  }
}

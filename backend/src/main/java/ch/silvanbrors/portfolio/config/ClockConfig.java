package ch.silvanbrors.portfolio.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

  /** "Today" on the page means today in Zurich, wherever the server runs. */
  public static final ZoneId ZONE = ZoneId.of("Europe/Zurich");

  @Bean
  Clock clock() {
    return Clock.system(ZONE);
  }
}

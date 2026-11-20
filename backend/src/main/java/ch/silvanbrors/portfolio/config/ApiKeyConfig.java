package ch.silvanbrors.portfolio.config;

import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ApiKeyProperties.class)
public class ApiKeyConfig {

  @Bean
  FilterRegistrationBean<ApiKeyFilter> apiKeyFilter(ApiKeyProperties keys) {
    ApiKeyFilter filter =
        new ApiKeyFilter(
            List.of(
                new ApiKeyFilter.Rule("/api/clipper/", keys.clipper()),
                new ApiKeyFilter.Rule("/api/agents/", keys.agents())));
    FilterRegistrationBean<ApiKeyFilter> registration = new FilterRegistrationBean<>(filter);
    registration.addUrlPatterns("/api/*");
    return registration;
  }
}

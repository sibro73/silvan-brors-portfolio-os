package ch.silvanbrors.portfolio.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/** Caffeine caches, configured in application.properties ({@code spring.cache.*}). */
@Configuration
@EnableCaching
public class CacheConfig {}

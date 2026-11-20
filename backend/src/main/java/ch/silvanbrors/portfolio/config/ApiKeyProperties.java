package ch.silvanbrors.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * API keys for the write endpoints, one per caller. Empty means "not configured": the endpoint
 * then stays closed.
 */
@ConfigurationProperties(prefix = "app.api-keys")
public record ApiKeyProperties(String clipper, String agents) {}

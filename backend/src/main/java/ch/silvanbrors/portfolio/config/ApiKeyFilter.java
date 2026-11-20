package ch.silvanbrors.portfolio.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Protects write requests with the header {@code X-Api-Key}. Reads (GET) stay public.
 *
 * <ul>
 *   <li>key not configured on the server → 503 (endpoint closed, nothing is accepted)
 *   <li>header missing or wrong → 401
 * </ul>
 */
public class ApiKeyFilter extends OncePerRequestFilter {

  public static final String HEADER = "X-Api-Key";

  /** Requests below {@code pathPrefix} need {@code key}. */
  public record Rule(String pathPrefix, String key) {}

  private final List<Rule> rules;

  public ApiKeyFilter(List<Rule> rules) {
    this.rules = List.copyOf(rules);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return isRead(request) || ruleFor(request).isEmpty();
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    Rule rule = ruleFor(request).orElseThrow();
    if (rule.key() == null || rule.key().isBlank()) {
      response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
      return;
    }
    String given = request.getHeader(HEADER);
    if (given == null || !constantTimeEquals(given, rule.key())) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }
    chain.doFilter(request, response);
  }

  private static boolean isRead(HttpServletRequest request) {
    String method = request.getMethod();
    return HttpMethod.GET.matches(method)
        || HttpMethod.HEAD.matches(method)
        || HttpMethod.OPTIONS.matches(method);
  }

  private Optional<Rule> ruleFor(HttpServletRequest request) {
    String path = request.getRequestURI().substring(request.getContextPath().length());
    return rules.stream().filter(r -> path.startsWith(r.pathPrefix())).findFirst();
  }

  /** Compares hashes, so neither content nor length leaks through timing. */
  static boolean constantTimeEquals(String a, String b) {
    return MessageDigest.isEqual(sha256(a), sha256(b));
  }

  private static byte[] sha256(String value) {
    try {
      return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 is always available", e);
    }
  }
}

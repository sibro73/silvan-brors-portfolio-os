package ch.silvanbrors.portfolio.ipa;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

/**
 * The visitor's IP for the rate limit. Behind Fly the socket address is the proxy, so the IP comes
 * from {@code Fly-Client-IP}, which the Fly proxy sets. Without that proxy the header could be
 * sent by anyone, so it is only read when explicitly trusted.
 */
@Component
public class ClientIpResolver {

  static final String FLY_HEADER = "Fly-Client-IP";

  private final boolean trustFly;

  public ClientIpResolver(IpaProperties properties) {
    this.trustFly = properties.trustFlyClientIp();
  }

  public String resolve(HttpServletRequest request) {
    if (trustFly) {
      String fly = request.getHeader(FLY_HEADER);
      if (fly != null && !fly.isBlank()) return fly.trim();
    }
    return request.getRemoteAddr();
  }
}

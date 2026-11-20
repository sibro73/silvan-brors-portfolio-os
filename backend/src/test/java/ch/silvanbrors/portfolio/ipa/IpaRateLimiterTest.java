package ch.silvanbrors.portfolio.ipa;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class IpaRateLimiterTest {

  private static IpaProperties props(int perMinute, int perDay, int global, boolean trustFly) {
    return new IpaProperties(
        "http://ipa.test", Duration.ofSeconds(30), perMinute, perDay, global, trustFly);
  }

  @Test
  void limitsEachIpPerMinute() {
    IpaRateLimiter limiter = new IpaRateLimiter(props(2, 30, 200, false));

    assertThat(limiter.tryAcquire("1.1.1.1").allowed()).isTrue();
    assertThat(limiter.tryAcquire("1.1.1.1").allowed()).isTrue();
    IpaRateLimiter.Decision third = limiter.tryAcquire("1.1.1.1");

    assertThat(third.allowed()).isFalse();
    assertThat(third.retryAfterSeconds()).isBetween(1L, 60L);
    // Another visitor is not affected
    assertThat(limiter.tryAcquire("2.2.2.2").allowed()).isTrue();
  }

  @Test
  void limitsEachIpPerDay() {
    IpaRateLimiter limiter = new IpaRateLimiter(props(10, 3, 200, false));
    for (int i = 0; i < 3; i++) assertThat(limiter.tryAcquire("1.1.1.1").allowed()).isTrue();

    IpaRateLimiter.Decision refused = limiter.tryAcquire("1.1.1.1");

    assertThat(refused.allowed()).isFalse();
    assertThat(refused.retryAfterSeconds()).isGreaterThan(60L);
  }

  @Test
  void limitsAllVisitorsTogether() {
    IpaRateLimiter limiter = new IpaRateLimiter(props(5, 30, 3, false));
    assertThat(limiter.tryAcquire("1.1.1.1").allowed()).isTrue();
    assertThat(limiter.tryAcquire("2.2.2.2").allowed()).isTrue();
    assertThat(limiter.tryAcquire("3.3.3.3").allowed()).isTrue();

    assertThat(limiter.tryAcquire("4.4.4.4").allowed()).isFalse();
  }

  @Test
  void readsFlyClientIpOnlyWhenTrusted() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.1");
    request.addHeader(ClientIpResolver.FLY_HEADER, "203.0.113.7");

    assertThat(new ClientIpResolver(props(5, 30, 200, true)).resolve(request))
        .isEqualTo("203.0.113.7");
    assertThat(new ClientIpResolver(props(5, 30, 200, false)).resolve(request))
        .isEqualTo("10.0.0.1");
  }

  @Test
  void fallsBackToTheSocketAddressWithoutHeader() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.1");

    assertThat(new ClientIpResolver(props(5, 30, 200, true)).resolve(request))
        .isEqualTo("10.0.0.1");
  }
}

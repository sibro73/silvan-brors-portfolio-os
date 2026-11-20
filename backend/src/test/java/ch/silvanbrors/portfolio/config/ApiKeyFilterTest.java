package ch.silvanbrors.portfolio.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ApiKeyFilterTest {

  private static final ApiKeyFilter FILTER =
      new ApiKeyFilter(
          List.of(
              new ApiKeyFilter.Rule("/api/clipper/", "clipper-secret"),
              new ApiKeyFilter.Rule("/api/agents/", "")));

  private record Result(int status, boolean passed) {}

  private static Result run(String method, String path, String key) throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest(method, path);
    if (key != null) request.addHeader(ApiKeyFilter.HEADER, key);
    MockHttpServletResponse response = new MockHttpServletResponse();
    MockFilterChain chain = new MockFilterChain();
    FILTER.doFilter(request, response, chain);
    return new Result(response.getStatus(), chain.getRequest() != null);
  }

  @Test
  void letsTheRightKeyThrough() throws Exception {
    assertThat(run("POST", "/api/clipper/events", "clipper-secret")).isEqualTo(new Result(200, true));
  }

  @Test
  void rejectsMissingOrWrongKey() throws Exception {
    assertThat(run("POST", "/api/clipper/events", null)).isEqualTo(new Result(401, false));
    assertThat(run("POST", "/api/clipper/events", "wrong")).isEqualTo(new Result(401, false));
    assertThat(run("POST", "/api/clipper/events", "")).isEqualTo(new Result(401, false));
  }

  @Test
  void closesTheEndpointWhenNoKeyIsConfigured() throws Exception {
    assertThat(run("POST", "/api/agents/report", "anything")).isEqualTo(new Result(503, false));
  }

  @Test
  void readsStayPublic() throws Exception {
    assertThat(run("GET", "/api/agents/report", null)).isEqualTo(new Result(200, true));
    assertThat(run("OPTIONS", "/api/clipper/events", null)).isEqualTo(new Result(200, true));
  }

  @Test
  void otherPathsAreNotTouched() throws Exception {
    assertThat(run("POST", "/api/status", null)).isEqualTo(new Result(200, true));
  }

  @Test
  void comparesWithoutShortcuts() {
    assertThat(ApiKeyFilter.constantTimeEquals("abc", "abc")).isTrue();
    assertThat(ApiKeyFilter.constantTimeEquals("abc", "abcd")).isFalse();
  }
}

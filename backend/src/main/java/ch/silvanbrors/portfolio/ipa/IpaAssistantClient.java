package ch.silvanbrors.portfolio.ipa;

import java.net.SocketTimeoutException;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Asks the separate ipa-assistant. Never forwards anything but the question. */
@Component
public class IpaAssistantClient {

  /** Why no answer came back. */
  public enum Failure {
    /** No URL configured. */
    OFFLINE,
    /** Not reachable or answered with an error. */
    UNAVAILABLE,
    /** No answer within the timeout. */
    TIMEOUT
  }

  public static class IpaException extends RuntimeException {
    private final Failure failure;

    IpaException(Failure failure, Throwable cause) {
      super(failure.name(), cause);
      this.failure = failure;
    }

    public Failure failure() {
      return failure;
    }
  }

  private final IpaProperties properties;
  private final RestClient rest;

  public IpaAssistantClient(IpaProperties properties) {
    this.properties = properties;
    JdkClientHttpRequestFactory factory =
        new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(properties.timeout()).build());
    factory.setReadTimeout(properties.timeout());
    RestClient.Builder configured = RestClient.builder().requestFactory(factory);
    if (properties.configured()) {
      configured.baseUrl(properties.url());
    }
    if (hasText(properties.accessClientId()) && hasText(properties.accessClientSecret())) {
      configured.defaultHeader("CF-Access-Client-Id", properties.accessClientId());
      configured.defaultHeader("CF-Access-Client-Secret", properties.accessClientSecret());
    }
    this.rest = configured.build();
  }

  public boolean configured() {
    return properties.configured();
  }

  /**
   * @throws IpaException with the reason when no usable answer came back
   */
  public IpaAnswer ask(String question) {
    if (!configured()) throw new IpaException(Failure.OFFLINE, null);
    try {
      IpaAnswer answer =
          rest.get()
              .uri(uri -> uri.path("/chat").queryParam("frage", question).build())
              .retrieve()
              .body(IpaAnswer.class);
      if (answer == null || !hasText(answer.antwort())) {
        throw new IpaException(Failure.UNAVAILABLE, null);
      }
      return answer;
    } catch (ResourceAccessException e) {
      throw new IpaException(isTimeout(e) ? Failure.TIMEOUT : Failure.UNAVAILABLE, e);
    } catch (RestClientException e) {
      throw new IpaException(Failure.UNAVAILABLE, e);
    }
  }

  private static boolean isTimeout(Throwable e) {
    for (Throwable t = e; t != null; t = t.getCause()) {
      if (t instanceof HttpTimeoutException || t instanceof SocketTimeoutException) return true;
    }
    return false;
  }

  private static boolean hasText(String s) {
    return s != null && !s.isBlank();
  }
}

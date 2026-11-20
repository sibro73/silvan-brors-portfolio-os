package ch.silvanbrors.portfolio.ipa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ch.silvanbrors.portfolio.ipa.IpaAssistantClient.Failure;
import ch.silvanbrors.portfolio.ipa.IpaAssistantClient.IpaException;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Against a real local HTTP server that plays ipa-assistant. */
class IpaAssistantClientTest {

  private static final String ANSWER =
      """
      {"antwort":"Ein Image ist die Vorlage.","quellen":[
        {"datei":"3.3 – Docker.md","abschnitt":"Images","score":0.81}]}
      """;

  private HttpServer server;
  private final AtomicReference<String> lastQuery = new AtomicReference<>();
  private volatile int status = 200;
  private volatile String body = ANSWER;
  private volatile long delayMs = 0;

  @BeforeEach
  void start() throws IOException {
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    server.createContext(
        "/chat",
        exchange -> {
          lastQuery.set(URLDecoder.decode(exchange.getRequestURI().getRawQuery(), StandardCharsets.UTF_8));
          try {
            Thread.sleep(delayMs);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
          }
          byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().add("Content-Type", "application/json");
          exchange.sendResponseHeaders(status, bytes.length);
          exchange.getResponseBody().write(bytes);
          exchange.close();
        });
    server.start();
  }

  @AfterEach
  void stop() {
    server.stop(0);
  }

  private String url() {
    return "http://127.0.0.1:" + server.getAddress().getPort();
  }

  private IpaAssistantClient client(String url, Duration timeout) {
    IpaProperties props = new IpaProperties(url, timeout, 5, 30, 200, false);
    return new IpaAssistantClient(props);
  }

  private IpaAssistantClient client() {
    return client(url(), Duration.ofSeconds(2));
  }

  @Test
  void passesTheQuestionAndReturnsAnswerWithSources() {
    IpaAnswer answer = client().ask("Image oder Container?");

    assertThat(lastQuery.get()).isEqualTo("frage=Image oder Container?");
    assertThat(answer.antwort()).isEqualTo("Ein Image ist die Vorlage.");
    assertThat(answer.quellen())
        .containsExactly(new IpaAnswer.Source("3.3 – Docker.md", "Images", 0.81));
  }

  @Test
  void acceptsTheNothingFoundAnswerWithoutSources() {
    body = "{\"antwort\":\"Dazu habe ich in deinen Lernunterlagen nichts gefunden.\",\"quellen\":[]}";
    assertThat(client().ask("Wetter?").quellen()).isEmpty();
  }

  @Test
  void offlineWithoutUrl() {
    IpaAssistantClient client = client("", Duration.ofSeconds(2));
    assertThat(client.configured()).isFalse();
    assertFailure(client, Failure.OFFLINE);
  }

  @Test
  void unavailableOnServerError() {
    status = 500;
    body = "{\"error\":\"boom\"}";
    assertFailure(client(), Failure.UNAVAILABLE);
  }

  @Test
  void unavailableOnEmptyAnswer() {
    body = "{\"antwort\":\"\",\"quellen\":[]}";
    assertFailure(client(), Failure.UNAVAILABLE);
  }

  @Test
  void unavailableWhenNobodyListens() {
    String deadUrl = url();
    server.stop(0);
    assertFailure(client(deadUrl, Duration.ofSeconds(2)), Failure.UNAVAILABLE);
  }

  @Test
  void timeoutWhenTheAnswerTakesTooLong() {
    delayMs = 1500;
    assertFailure(client(url(), Duration.ofMillis(300)), Failure.TIMEOUT);
  }

  private static void assertFailure(IpaAssistantClient client, Failure expected) {
    assertThatThrownBy(() -> client.ask("Frage"))
        .isInstanceOfSatisfying(IpaException.class, e -> assertThat(e.failure()).isEqualTo(expected));
  }
}

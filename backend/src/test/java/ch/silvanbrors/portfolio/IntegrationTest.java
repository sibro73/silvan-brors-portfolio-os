package ch.silvanbrors.portfolio;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;

/**
 * Full application against a real Postgres (Testcontainers). All integration tests share the same
 * settings, so Spring reuses one context and one container.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    properties = {
      "app.api-keys.clipper=" + IntegrationTest.CLIPPER_KEY,
      "app.api-keys.agents=" + IntegrationTest.AGENTS_KEY,
      // Tests share one context: without a cache, every test sees the current database
      "spring.cache.type=none"
    })
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public @interface IntegrationTest {
  String CLIPPER_KEY = "test-clipper-key";
  String AGENTS_KEY = "test-agents-key";
}

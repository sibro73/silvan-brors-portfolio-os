package ch.silvanbrors.portfolio;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.simple.JdbcClient;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class PortfolioApplicationTests {

  @Autowired private JdbcClient jdbc;

  @Test
  void contextLoadsAndFlywayRan() {
    Integer applied =
        jdbc.sql("select count(*) from flyway_schema_history where success").query(Integer.class).single();
    assertThat(applied).isNotNull();
  }
}

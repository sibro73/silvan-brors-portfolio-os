package ch.silvanbrors.portfolio;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;

@IntegrationTest
class PortfolioApplicationTests {

  @Autowired private JdbcClient jdbc;

  @Test
  void contextLoadsAndMigrationsRan() {
    Integer failed =
        jdbc.sql("select count(*) from flyway_schema_history where not success")
            .query(Integer.class)
            .single();
    Integer tables =
        jdbc.sql("select count(*) from information_schema.tables where table_name = 'clip_event'")
            .query(Integer.class)
            .single();
    assertThat(failed).isZero();
    assertThat(tables).isEqualTo(1);
  }
}

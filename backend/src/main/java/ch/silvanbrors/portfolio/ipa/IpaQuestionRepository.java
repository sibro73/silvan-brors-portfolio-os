package ch.silvanbrors.portfolio.ipa;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/** Counts answered questions. Stores only the time, never the question itself. */
@Repository
public class IpaQuestionRepository {

  private final JdbcClient jdbc;

  public IpaQuestionRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  public void recordAnswered() {
    jdbc.sql("insert into ipa_question default values").update();
  }

  public int countAnswered() {
    return jdbc.sql("select count(*) from ipa_question").query(Integer.class).single();
  }
}

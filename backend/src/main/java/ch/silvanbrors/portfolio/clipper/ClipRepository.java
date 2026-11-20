package ch.silvanbrors.portfolio.clipper;

import java.sql.Timestamp;
import java.time.Instant;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class ClipRepository {

  private final JdbcClient jdbc;

  public ClipRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  /** Returns {@code true} if the clip is new, {@code false} if it was already stored. */
  public boolean insertIfAbsent(String clipId, Instant createdAt) {
    int rows =
        jdbc.sql(
                "insert into clip_event (clip_id, created_at) values (:id, :createdAt)"
                    + " on conflict (clip_id) do nothing")
            .param("id", clipId)
            .param("createdAt", Timestamp.from(createdAt))
            .update();
    return rows == 1;
  }

  /** Clips with {@code from <= created_at < to}. */
  public int countCreatedBetween(Instant from, Instant to) {
    return jdbc.sql(
            "select count(*) from clip_event where created_at >= :from and created_at < :to")
        .param("from", Timestamp.from(from))
        .param("to", Timestamp.from(to))
        .query(Integer.class)
        .single();
  }
}

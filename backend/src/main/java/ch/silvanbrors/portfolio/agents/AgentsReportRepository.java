package ch.silvanbrors.portfolio.agents;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;

@Repository
public class AgentsReportRepository {

  /** A stored report and when it arrived. */
  public record Stored(AgentsReport report, Instant receivedAt) {}

  private final JdbcClient jdbc;
  private final JsonMapper json;

  public AgentsReportRepository(JdbcClient jdbc, JsonMapper json) {
    this.jdbc = jdbc;
    this.json = json;
  }

  public void save(AgentsReport report) {
    jdbc.sql("insert into agents_report (report) values (cast(:report as jsonb))")
        .param("report", json.writeValueAsString(report))
        .update();
  }

  public Optional<Stored> latest() {
    return jdbc.sql(
            "select report::text as report, received_at from agents_report"
                + " order by received_at desc, id desc limit 1")
        .query(
            (rs, row) ->
                new Stored(
                    json.readValue(rs.getString("report"), AgentsReport.class),
                    rs.getObject("received_at", OffsetDateTime.class).toInstant()))
        .optional();
  }

  /** Only the time of the newest report, without reading the report itself. */
  public Optional<Instant> latestReceivedAt() {
    return jdbc.sql("select max(received_at) from agents_report")
        .query((rs, row) -> rs.getObject(1, OffsetDateTime.class))
        .optional()
        .map(OffsetDateTime::toInstant);
  }
}

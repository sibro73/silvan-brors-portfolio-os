package ch.silvanbrors.portfolio.agents;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET is public (the frontend shows the newest report). POST is for the agents and needs {@code
 * X-Api-Key} (see ApiKeyFilter).
 */
@RestController
@RequestMapping("/api/agents/report")
public class AgentsReportController {

  private final AgentsReportRepository reports;

  public AgentsReportController(AgentsReportRepository reports) {
    this.reports = reports;
  }

  @GetMapping
  public ResponseEntity<AgentsReport> latest() {
    return reports
        .latest()
        .map(stored -> ResponseEntity.ok(stored.report()))
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public void publish(@Valid @RequestBody AgentsReport report) {
    reports.save(report);
  }
}

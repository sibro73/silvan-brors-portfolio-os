package ch.silvanbrors.portfolio.agents;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Weekly report in exactly the shape the frontend renders ({@code data/agents-report.json}).
 * Used for both writing (agents) and reading (frontend).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AgentsReport(
    @NotBlank @Size(max = 200) String meta,
    @NotBlank @Size(max = 50) String week,
    @NotBlank @Size(max = 200) String title,
    @NotBlank @Size(max = 2000) String intro,
    @NotNull @Size(min = 1, max = 10) List<@Valid @NotNull Channel> channels,
    @NotBlank @Size(max = 2000) String recommendation,
    @Size(max = 500) String note) {

  /**
   * @param barWidth bar length in percent of the widest bar (0–100)
   * @param views already formatted for display, e.g. "12.4k"
   */
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record Channel(
      @NotBlank @Size(max = 50) String name,
      @Min(0) @Max(100) int barWidth,
      Boolean highlight,
      @NotBlank @Size(max = 50) String views) {}
}

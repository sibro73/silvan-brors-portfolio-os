package ch.silvanbrors.portfolio.clipper;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/**
 * What the Clipper sends per clip.
 *
 * @param clipId the Clipper's own ID of the clip; sending it twice counts once
 * @param createdAt when the clip was cut (ISO 8601 with offset, e.g. 2026-11-20T14:05:00Z)
 */
public record ClipEventRequest(
    @NotBlank @Size(max = 100) @Pattern(regexp = "[A-Za-z0-9._:-]+") String clipId,
    @NotNull Instant createdAt) {}

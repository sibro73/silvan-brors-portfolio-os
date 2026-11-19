package ch.silvanbrors.portfolio.status;

import java.time.LocalDate;

/**
 * Live numbers for the frontend (desktop and terminal {@code curl /api/status}).
 *
 * <p>A {@code null} value means "not available yet". The frontend then keeps showing its
 * placeholder (e.g. {@code [live]}) instead of a made-up number.
 *
 * @param wishlists Steam wishlists for Rigged to Riches
 * @param clipsHeute clips the Clipper produced today (Europe/Zurich)
 * @param ipaFragen questions answered by the IPA assistant
 * @param letzterBericht date of the latest weekly marketing report
 */
public record StatusResponse(
    Integer wishlists, Integer clipsHeute, Integer ipaFragen, LocalDate letzterBericht) {

  /** Nothing is connected yet (phase 2). Real sources follow in phase 4. */
  public static StatusResponse unavailable() {
    return new StatusResponse(null, null, null, null);
  }
}

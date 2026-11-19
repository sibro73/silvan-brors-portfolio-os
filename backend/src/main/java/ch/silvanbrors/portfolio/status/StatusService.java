package ch.silvanbrors.portfolio.status;

import org.springframework.stereotype.Service;

/**
 * Collects the live numbers. External sources (Steam, Clipper, reports) are never queried per
 * request: from phase 4 on, schedulers fill a cache and this service only reads from it.
 */
@Service
public class StatusService {

  public StatusResponse currentStatus() {
    return StatusResponse.unavailable();
  }
}

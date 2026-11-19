package ch.silvanbrors.portfolio.status;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class StatusServiceTest {

  @Test
  void reportsNothingUntilRealSourcesAreConnected() {
    StatusResponse status = new StatusService().currentStatus();

    assertThat(status.wishlists()).isNull();
    assertThat(status.clipsHeute()).isNull();
    assertThat(status.ipaFragen()).isNull();
    assertThat(status.letzterBericht()).isNull();
  }
}

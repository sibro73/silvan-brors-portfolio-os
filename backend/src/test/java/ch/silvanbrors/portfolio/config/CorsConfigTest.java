package ch.silvanbrors.portfolio.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ch.silvanbrors.portfolio.status.StatusController;
import ch.silvanbrors.portfolio.status.StatusResponse;
import ch.silvanbrors.portfolio.status.StatusService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StatusController.class)
@TestPropertySource(
    properties = "app.cors.allowed-origins=https://silvanbrors.ch, http://localhost:5173")
class CorsConfigTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private StatusService statusService;

  @BeforeEach
  void stubStatus() {
    Mockito.when(statusService.currentStatus()).thenReturn(StatusResponse.unavailable());
  }

  @Test
  void allowsConfiguredOrigin() throws Exception {
    mockMvc
        .perform(get("/api/status").header(HttpHeaders.ORIGIN, "https://silvanbrors.ch"))
        .andExpect(status().isOk())
        .andExpect(
            header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://silvanbrors.ch"));
  }

  @Test
  void trimsWhitespaceInTheOriginList() throws Exception {
    mockMvc
        .perform(get("/api/status").header(HttpHeaders.ORIGIN, "http://localhost:5173"))
        .andExpect(status().isOk())
        .andExpect(
            header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
  }

  @Test
  void rejectsUnknownOrigin() throws Exception {
    mockMvc
        .perform(get("/api/status").header(HttpHeaders.ORIGIN, "https://evil.example"))
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
  }

  @Test
  void preflightAllowsGetOnly() throws Exception {
    mockMvc
        .perform(
            options("/api/status")
                .header(HttpHeaders.ORIGIN, "https://silvanbrors.ch")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET"));

    mockMvc
        .perform(
            options("/api/status")
                .header(HttpHeaders.ORIGIN, "https://silvanbrors.ch")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "DELETE"))
        .andExpect(status().isForbidden());
  }
}

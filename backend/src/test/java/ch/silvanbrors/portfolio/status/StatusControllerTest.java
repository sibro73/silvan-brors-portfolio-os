package ch.silvanbrors.portfolio.status;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StatusController.class)
class StatusControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private StatusService statusService;

  @Test
  void returnsNullsWhileNoSourceIsConnected() throws Exception {
    when(statusService.currentStatus()).thenReturn(StatusResponse.unavailable());

    mockMvc
        .perform(get("/api/status"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.wishlists").value((Object) null))
        .andExpect(jsonPath("$.clipsHeute").value((Object) null))
        .andExpect(jsonPath("$.ipaFragen").value((Object) null))
        .andExpect(jsonPath("$.letzterBericht").value((Object) null));
  }

  @Test
  void returnsValuesWithIsoDate() throws Exception {
    when(statusService.currentStatus())
        .thenReturn(new StatusResponse(120, 4, 37, LocalDate.of(2026, 11, 16)));

    mockMvc
        .perform(get("/api/status"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.wishlists").value(120))
        .andExpect(jsonPath("$.clipsHeute").value(4))
        .andExpect(jsonPath("$.ipaFragen").value(37))
        .andExpect(jsonPath("$.letzterBericht").value("2026-11-16"));
  }

  @Test
  void rejectsOtherMethods() throws Exception {
    mockMvc.perform(post("/api/status")).andExpect(status().isMethodNotAllowed());
  }
}

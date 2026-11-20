package ch.silvanbrors.portfolio.ipa;

import java.util.List;

/**
 * Answer of ipa-assistant ({@code GET /chat}), passed through unchanged. The sources come from
 * the chunks used, not from the LLM.
 */
public record IpaAnswer(String antwort, List<Source> quellen) {

  public IpaAnswer {
    quellen = quellen == null ? List.of() : List.copyOf(quellen);
  }

  /** A chunk that was given to the LLM as context. */
  public record Source(String datei, String abschnitt, double score) {}
}

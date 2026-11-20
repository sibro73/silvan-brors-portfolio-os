## Phase 5: IPA-Demo anbinden

Der Chat im Fenster «IPA-Assistent» kann echte Fragen stellen, aber **nur lokal**.
Den RAG baut dieser PR **nicht** nach. Die Fragen gehen an das bestehende, separate Projekt
`ipa-assistant` (Spring AI, Ollama `llama3.1:8b`, pgvector). `ipa-assistant` selbst ist unverändert.
Es darf nicht öffentlich sein. Darum zeigt die Live-Seite nur die Beispielantworten,
mit dem Hinweis «Läuft nur lokal».

### Änderungen
- **`ipa/IpaAssistantClient`:** `GET {IPA_ASSISTANT_URL}/chat?frage=…` mit Timeout (30 s).
  Ohne URL ist der Assistent offline. In Produktion bleibt die URL leer.
- **Rate-Limit** (Bucket4j): 5 Fragen pro Minute und 30 pro Tag pro IP, dazu 200 pro Tag insgesamt.
  Die IP kommt aus `Fly-Client-IP`, aber nur hinter Fly (`TRUST_FLY_CLIENT_IP`).
  Ohne Fly liest das Backend den Header nicht, weil er sonst fälschbar wäre.
- **`POST /api/ipa/ask`:** Die Frage hat 3–300 Zeichen. Antwort und Quellen gibt der Endpunkt
  unverändert weiter. Fehler kommen als `400`/`429`/`503`/`504` mit einem deutschen Text, den der
  Chat direkt anzeigt. Ist der Assistent offline, verbraucht die Frage kein Kontingent.
  CORS erlaubt POST nur für `/api/ipa/**`.
- **`ipaFragen` im Status:** Tabelle `ipa_question`, nur mit dem Zeitpunkt, **ohne den Text der Frage**.
  Gab es noch keine Frage, bleibt der Wert `null`.
- **Chat im Frontend:** Das Eingabefeld erscheint nur mit `VITE_IPA_LIVE=true` (lokal).
  Es nimmt höchstens 300 Zeichen an, hat Klickflächen von 44 px und ein Label für Screenreader. Dazu kommen
  «denkt nach …», Antwort mit Quellen («Datei › Abschnitt»), Fehler als Chat-Nachricht.
  Die Beispielfragen funktionieren weiter und sind als «Beispielantwort» markiert.
  Die Fusszeile zeigt die echte Technik von `ipa-assistant` statt `[LLM] / [Vektor-DB]`,
  ohne Eingabefeld mit dem Zusatz «Läuft nur lokal · hier Beispielantworten», auch in der Klassischen Ansicht.
- **Doku:** `docs/api.md`, `.env.example`, `docker-compose.yml`, `CLAUDE.md`, Plan.
  `docs/api.md` erklärt, wie man den Chat lokal gegen `ipa-assistant` laufen lässt.

### Tests
- Backend: 51 Tests grün.
  - Den Client teste ich gegen einen echten lokalen HTTP-Server: OK, «nichts gefunden», offline,
    500, leere Antwort, niemand hört zu, Timeout.
  - Rate-Limiter und IP-Erkennung mit Einheitstests.
  - Den Endpunkt mit MockMvc und Postgres (Testcontainers): Weitergabe, Validierung,
    offline ohne Verbrauch, 429, Fehlertexte, CORS.
- Frontend: Lint, 178 Tests und Build grün.
- **Nicht getestet:** ein echter Aufruf an einen laufenden `ipa-assistant` und das Aussehen
  des neuen Eingabefelds im Browser.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

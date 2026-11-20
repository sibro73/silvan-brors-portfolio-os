## Phase 5: IPA-Demo anbinden

Der Chat im Fenster «IPA-Assistent» stellt jetzt echte Fragen. Den RAG baut dieser PR
**nicht** nach. Die Fragen gehen an das bestehende, separate Projekt `ipa-assistant`
(Spring AI, Ollama `llama3.1:8b`, pgvector). `ipa-assistant` selbst ist unverändert.

### Änderungen
- **`ipa/IpaAssistantClient`:** `GET {IPA_ASSISTANT_URL}/chat?frage=…` mit Timeout (30 s).
  Ohne URL ist der Assistent offline. Optional schickt der Client die Header für ein
  Cloudflare-Access-Service-Token mit, als Vorbereitung für den Tunnel.
- **Rate-Limit** (Bucket4j): 5 Fragen pro Minute und 30 pro Tag pro IP, dazu 200 pro Tag insgesamt.
  Die IP kommt aus `Fly-Client-IP`, aber nur hinter Fly (`TRUST_FLY_CLIENT_IP`).
  Ohne Fly liest das Backend den Header nicht, weil er sonst fälschbar wäre.
- **`POST /api/ipa/ask`:** Die Frage hat 3–300 Zeichen. Antwort und Quellen gibt der Endpunkt
  unverändert weiter. Fehler kommen als `400`/`429`/`503`/`504` mit einem deutschen Text, den der
  Chat direkt anzeigt. Ist der Assistent offline, verbraucht die Frage kein Kontingent.
  CORS erlaubt POST nur für `/api/ipa/**`.
- **`ipaFragen` im Status:** Tabelle `ipa_question`, nur mit dem Zeitpunkt, **ohne den Text der Frage**.
  Gab es noch keine Frage, bleibt der Wert `null`.
- **Chat im Frontend:** Eingabefeld (höchstens 300 Zeichen, Klickflächen 44 px, Label für Screenreader),
  «denkt nach …», Antwort mit Quellen («Datei › Abschnitt»), Fehler als Chat-Nachricht.
  Die Beispielfragen funktionieren weiter und sind als «Beispielantwort» markiert.
  Die Fusszeile zeigt die echte Technik von `ipa-assistant` statt `[LLM] / [Vektor-DB]`.
- **Doku:** `docs/api.md`, `.env.example`, `docker-compose.yml`, `CLAUDE.md`, Plan.
  In `docs/deploy.md` steht neu ein Abschnitt zum späteren Tunnel samt **Cloudflare Access**,
  weil `ipa-assistant` kein Login hat.

### Tests
- Backend: 52 Tests grün.
  - Den Client teste ich gegen einen echten lokalen HTTP-Server: OK, «nichts gefunden», Access-Header,
    offline, 500, leere Antwort, niemand hört zu, Timeout.
  - Rate-Limiter und IP-Erkennung mit Einheitstests.
  - Den Endpunkt mit MockMvc und Postgres (Testcontainers): Weitergabe, Validierung,
    offline ohne Verbrauch, 429, Fehlertexte, CORS.
- Frontend: Lint, 177 Tests und Build grün.
- **Nicht getestet:** ein echter Aufruf an einen laufenden `ipa-assistant` und das Aussehen
  des neuen Eingabefelds im Browser.

### Offen
- [ ] `ipa-assistant` öffentlich erreichbar machen (Tunnel + Access, `docs/deploy.md` Abschnitt 6).
  Vorher mit ti&m klären, ob das Lernprojekt öffentlich sein darf.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

## Phase 4: Echte Daten

Das Backend speichert jetzt echte Daten in Postgres. Der Clipper meldet Clips, die Agents
liefern den Wochenbericht ab, und `/api/status` zeigt «Clips heute» und das Datum des letzten Berichts.

### Änderungen
- **Postgres + Flyway:** JDBC (`JdbcClient`, kein JPA) mit zwei Migrationen
  (`clip_event`, `agents_report`). Hikari hält keine offenen Verbindungen
  (`minimum-idle=0`), damit die Datenbank in Produktion (Neon, Free-Plan) schlafen kann.
  Der Health-Check prüft die DB bewusst nicht: Ohne DB bleibt die API erreichbar, und der
  Status antwortet mit `null`.
- **API-Key-Filter** (`config/ApiKeyFilter`): Der Header `X-Api-Key` wird über SHA-256-Hashes
  in konstanter Zeit verglichen, es gibt einen Key pro Aufrufer. Fehlt der Key auf dem Server,
  antwortet der Endpunkt mit 503. Fehlt er in der Anfrage oder ist er falsch, kommt 401. GET bleibt öffentlich.
- **`POST /api/clipper/events`:** `{clipId, createdAt}` mit Validierung. Derselbe `clipId`
  wird nur einmal gezählt (`on conflict do nothing`). Liegt ein Zeitpunkt mehr als 5 Minuten
  in der Zukunft, wird er abgelehnt.
- **`POST`/`GET /api/agents/report`:** Der Bericht wird in derselben Form wie
  `data/agents-report.json` als `jsonb` gespeichert. Das Fenster «Wochenbericht» lädt ihn mit
  Fallback auf `data/`. Dafür ist der gemeinsame `getJson`-Helper aus dem Status-Code entstanden.
- **`/api/status`:** `clipsHeute` zählt von Mitternacht bis Mitternacht in Zürich,
  `letzterBericht` ist das Datum des neusten Berichts. Die Antwort wird 30 s gecacht (Caffeine).
  Hat der Clipper noch nie etwas gemeldet, bleibt `clipsHeute` auf `null` und nicht auf `0`,
  damit die Seite keine echt wirkende Null zeigt.
- **Steam:** noch kein Code. Die Prüfung steht in `docs/steam.md`: Es braucht einen
  Financial-API-Key, und der genaue Endpunkt ist nicht bestätigt.
- **Doku:** `docs/api.md` (für Clipper und Agents, mit `curl`), Einrichtung von Neon und den
  Secrets in `docs/deploy.md`, `.env.example`, `CLAUDE.md`.

### Tests
- Backend: 32 Tests grün, darunter Integrationstests mit Testcontainers gegen Postgres 18.
  Diese brauchen Docker, auf GitHub Actions ist es vorhanden.
- Frontend: Lint, 168 Tests und Build grün. Vitest schickt keine echten Requests mehr (`VITE_API_URL=''`).
- Von Hand mit `docker compose`:
  - Clip ohne Key → 401, mit Key → 201, nochmals → 200.
  - Bericht 404 → POST 201 → GET liefert ihn.
  - Status nach Ablauf des Caches: `clipsHeute: 1`, `letzterBericht: 2026-11-20`.
  - CORS und Health funktionieren.

### Offen
- [ ] Der Clipper ruft den Endpunkt auf (eigenes Projekt)
- [ ] Die Agents schicken den Bericht
- [ ] Steam: Financial-API-Key in Steamworks prüfen (`docs/steam.md`)
- [ ] Für den Deploy: Neon-Projekt und Fly-Secrets (`docs/deploy.md`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

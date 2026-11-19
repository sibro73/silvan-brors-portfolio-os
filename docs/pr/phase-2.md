# Phase 2: Backend MVP

Branch `feat/backend-status` → `main`

## Worum geht's

Das Backend steht als Grundgerüst. `GET /api/status` liefert die Live-Zahlen, CORS ist
eingerichtet, Backend und Postgres laufen mit Docker Compose, und CI baut und testet Frontend
und Backend bei jedem PR. Das Frontend holt den Status vom Backend. Ist das Backend nicht
erreichbar, zeigt es weiter die gespeicherten Daten aus `data/`.

## Was drin ist

- **Backend** (`backend/`): Spring Boot **4.0.9**, Java 21 (`release 21`), Maven Wrapper.
  Package `ch.silvanbrors.portfolio`.
- **`GET /api/status`** (`status/`): Record `StatusResponse(wishlists, clipsHeute, ipaFragen,
  letzterBericht)`. Solange keine Quelle angeschlossen ist, sind **alle Werte `null`**. Das
  Frontend zeigt dann weiter `[live]` bzw. `[Datum]`, es gibt keine erfundenen Zahlen. Echte
  Werte kommen in Phase 4 (Scheduler + Cache).
- **CORS** (`config/`): Die erlaubten Origins kommen aus `FRONTEND_ORIGIN` (kommagetrennt,
  Standard `http://localhost:5173`). Nur `GET` auf `/api/**`, keine Credentials.
- **Härtung:** Actuator gibt nur `health` frei, ohne Details. Fehlerantworten enthalten weder
  Stacktrace noch Message.
- **Docker:** Multi-stage `backend/Dockerfile` (Temurin 21 JRE, Nicht-root-Benutzer `app`,
  Healthcheck). `docker-compose.yml` mit backend + postgres 18. Die Ports binden nur an
  `127.0.0.1` und sind einstellbar (`BACKEND_PORT`, Standard 8080, und `POSTGRES_PORT`,
  Standard 5433, weil 5432 oft schon von einer lokalen Postgres belegt ist).
  `POSTGRES_PASSWORD` ist Pflicht und hat keinen Standardwert.
- **CI** (`.github/workflows/`): `frontend.yml` (npm ci, lint, test, build) und `backend.yml`
  (`./mvnw verify` und `docker build`). Sie laufen nur, wenn sich der jeweilige Ordner ändert.
- **Frontend:**
  - `api/status.ts`: `fetchStatus()` mit Timeout von 3 s. Es wirft nie: Bei fehlendem
    Backend, HTTP-Fehler, Netzwerkfehler, Timeout oder unerwarteter Antwort kommen die
    gespeicherten Daten zurück. Einzelne `null`-Werte behalten ihren Platzhalter.
  - `StatusProvider` / `useStatus()`: lädt einmal beim Start. Terminal (`curl`), Rigged to
    Riches und die klassische Ansicht lesen den Status daraus.
  - Die Basis-URL kommt aus `VITE_API_URL` (Vorlage `frontend/.env.example`). Ohne Angabe
    gibt es in Produktion keinen Request, im Dev-Modus gilt `http://localhost:8080`.
  - `curl /api/status` schreibt im Offline-Fall `# Offline-Modus: gespeicherte Daten` dazu.

## Entscheide

- **Spring Boot 4 statt 3:** Initializr bietet 3.x nicht mehr an. Die letzte 3.5-Version
  (3.5.16) ist vom 25.06.2026, seither gibt es keine kostenlosen Sicherheitsupdates mehr.
  CLAUDE.md, README und Plan sind angepasst.
- **`null` statt Testdaten** für `/api/status`, wegen der Regel «Nichts erfinden».
- **`FRONTEND_ORIGIN`** statt eines neuen Variablennamens, weil es schon in `.env.example`
  stand.
- **Postgres** läuft in Compose mit, das Backend verbindet sich aber erst in Phase 4
  (Flyway, Clips pro Tag).
- **`mvnw`** ist in Git als ausführbar markiert (`100755`), sonst scheitert `./mvnw` auf
  Linux-Runnern.

## Tests

- **Backend** (JUnit 5, MockMvc): Status mit `null`-Werten und mit Werten (ISO-Datum),
  `POST` gibt 405, CORS (erlaubte Origin, Leerzeichen in der Liste, fremde Origin gibt 403,
  Preflight nur `GET`), Context-Load.
- **Frontend** (Vitest): `fetchStatus` (live, `null`-Werte, kein Backend, 500,
  Netzwerkfehler, falsche Antwort, Timeout), `mergeStatus`, `StatusProvider` (Platzhalter,
  dann Live-Zahlen), Terminal-`curl` live und offline. Insgesamt 92 Tests.
- **Manuell:** `docker compose up --build`. Das Backend wurde healthy, lief als `uid=10001(app)`,
  `/api/status` gab nur `null`, fremde Origin bekam 403, `/actuator/env` gab 404.

## Prüfen

```bash
cp .env.example .env            # POSTGRES_PASSWORD setzen
docker compose up --build
curl http://localhost:8080/api/status
cd frontend && npm run dev      # Terminal: curl /api/status
```

## Nicht in diesem PR

Deployment und Domain (Phase 3), echte Daten, Postgres-Anbindung und Flyway (Phase 4).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

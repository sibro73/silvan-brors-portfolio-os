# Silvan OS – Portfolio

Persönliches Portfolio von Silvan Brors (Applikationsentwickler EFZ, ti&m, Zürich).
Die Seite sieht aus wie ein echter Mac-Desktop: Menüleiste, Schreibtisch-Icons,
verschiebbare Fenster, Dock und ein Terminal, in das man tippen kann.
Jedes Projekt ist eine "App" in einem eigenen Fenster.

Design-Referenz: `docs/design/desktop-reference.dc.html` (Entwurf aus Claude Design).
Farben, Abstände, Texte und Verhalten von dort übernehmen. Die Datei ist eine
Referenz, kein Code zum Weiterverwenden.

## Aufbau

```
silvan-os/
├── frontend/        React + TypeScript + Vite
├── backend/         Spring Boot 4, Java 21, Maven
├── docs/            Plan, Design-Referenz, Entscheide
├── docker-compose.yml   lokal: backend + postgres
└── .github/workflows/   CI für frontend und backend
```

### Frontend (`frontend/`)

```
src/
├── main.tsx
├── App.tsx                  Wechsel Desktop / Mobile / Klassische Ansicht
├── os/
│   ├── MenuBar.tsx          Logo, aktive App, Menüs, WLAN, Akku, Uhr (Europe/Zurich)
│   ├── menu/                Dropdown, Popover (WLAN/Akku/Kalender), Kalender-Logik
│   ├── menu.config.ts       Menüstruktur als Daten (Einträge → Aktions-ID)
│   ├── actions.ts           zentrale Aktionsliste für Menü, Tastenkürzel, Willkommensfenster
│   ├── shortcuts.ts         Tastenkürzel (Alt+W, Alt+M, …)
│   ├── preferences.ts       Hintergrund, dunkle Fenster (localStorage mit try/catch)
│   ├── Desktop.tsx          Hintergrund, Schreibtisch-Icons, Fensterfläche
│   ├── Window.tsx           Titelleiste, Ampel-Buttons, Drag per Pointer-Events
│   ├── Dock.tsx             App-Icons, Hover-Vergrösserung, Punkt für offene Apps
│   ├── Notification.tsx     Benachrichtigung oben rechts
│   └── windowStore.ts       Zustand: offen/minimiert/maximiert, x/y, z-Reihenfolge
├── apps/                    Ein Ordner pro App (Inhalt eines Fensters)
│   ├── welcome/             Willkommensfenster (Startfenster)
│   ├── about/               Über mich.txt
│   ├── finder/              Ordner "Projekte"
│   ├── terminal/            Terminal + commands.ts (Befehlstabelle)
│   ├── rigged-to-riches/    Steam-Ansicht
│   ├── clipper/             Telegram-Chat
│   ├── ipa-assistent/       Chat mit RAG-Backend
│   ├── agents/              Wochenbericht (PDF-Vorschau)
│   ├── mail/                Kontakt
│   ├── lebenslauf/          PDF-Vorschau
│   ├── wetter/, shop-outreach/   kleine Projekte aus dem Ordner «Projekte»
│   └── about-os/, shortcuts/     «Über Silvan OS», «Tastenkürzel»
├── apps.registry.ts         Liste aller Apps: id, Titel, Icon, Standardgrösse/-position
├── api/                     fetch-Funktionen für das Backend
├── data/                    statische Fallback-Daten (JSON), solange das Backend fehlt
└── classic/                 "Klassische Ansicht": alles auf einer schlichten Seite
```

Regeln:
- Neue App = neuer Ordner in `apps/` + Eintrag in `apps.registry.ts`. Sonst nichts anfassen.
- Neuer Terminal-Befehl = ein Eintrag in `apps/terminal/commands.ts`.
- Neuer Menüeintrag = Aktion in `os/actions.ts` + Eintrag in `os/menu.config.ts`.
  Menü, Tastenkürzel und Buttons rufen nur Aktionen auf, keine eigene Logik.
- Kein UI-Framework für Fenster (kein react-rnd o. ä.). Drag selbst mit Pointer-Events.
- Unter 860 px Breite: Fenster untereinander stapeln, kein Drag.
- Barrierefreiheit: echte `<button>`/`<a>`, `aria-label` für Icon-Buttons,
  Klickflächen mind. 44 px (die Ampel-Punkte haben eine grössere unsichtbare Fläche),
  `prefers-reduced-motion` respektieren.
- Fehlt das Backend oder antwortet es nicht, zeigt die Seite die Daten aus `data/`.
  Die Seite darf nie leer oder kaputt aussehen.

### Backend (`backend/`)

Package `ch.silvanbrors.portfolio`:

```
├── status/      GET  /api/status          Live-Zahlen für Frontend und Terminal
├── clipper/     POST /api/clipper/events  Clipper meldet Clips (Header X-Api-Key)
├── steam/       Scheduler, holt Steam-Daten, Ergebnis im Cache
├── agents/      GET  /api/agents/report   letzter Wochenbericht
├── ipa/         POST /api/ipa/ask         Frage an den Lernassistenten (Rate-Limit!)
└── config/      CORS, Cache (Caffeine), Security für API-Keys
```

Regeln:
- Java 21, Spring Boot 4, Maven. Records für DTOs.
- Postgres für Verlauf (Clips pro Tag, Berichte). Flyway für Migrationen.
- Externe APIs nie pro Request abfragen: Scheduler + Cache.
- `/api/ipa/ask`: Rate-Limit pro IP (z. B. Bucket4j), max. Länge der Frage, Timeout.
- Secrets nur über Umgebungsvariablen (`STEAM_API_KEY`, `CLIPPER_API_KEY`, `LLM_API_KEY`).
  Nie committen. `.env.example` pflegen.
- Tests: JUnit 5, MockMvc für Controller, Testcontainers für Postgres.

## Befehle

Frontend (in `frontend/`):
- `npm run dev`, `npm run build`, `npm run test` (Vitest), `npm run lint`

Backend (in `backend/`):
- `./mvnw spring-boot:run`, `./mvnw test`, `./mvnw verify`

Lokal alles zusammen: `docker compose up`

## Arbeitsweise

- Jede Phase aus `docs/plan.md` ist ein eigener Branch und ein eigener PR.
- Kleine, beschreibende Commits auf Englisch (`feat: draggable windows`).
- Vor jedem PR: Build, Tests und Lint grün.
- Texte auf der Seite: Deutsch (Schweiz, "ss" statt "ß"). Code und Commits: Englisch.
- Platzhalter in eckigen Klammern (z. B. `[live]`, `[Sek.]`) bleiben, bis echte Daten da sind.
  Nichts erfinden: keine Fake-Zahlen, keine Fake-Screenshots.

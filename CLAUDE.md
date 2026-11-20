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
├── docs/            Plan, Design-Referenz, Entscheide, deploy.md, api.md
├── docker-compose.yml   lokal: backend + postgres
└── .github/workflows/   CI für frontend und backend
```

### Frontend (`frontend/`)

```
src/
├── main.tsx
├── App.tsx                  Wechsel Handy / Desktop (matchMedia, React.lazy) / Klassische Ansicht
├── desktop/                 Computer-Ansicht (ab 860 px) nach design/desktop.dc.html
│   ├── DesktopView.tsx      Einstieg: Einstellungen, Neustart, Bootscreen
│   ├── DesktopShell.tsx     der ganze «Mac»: Menüleiste, Schreibtisch, Fenster, Dock
│   ├── MenuBar.tsx          Logo, aktive App, Menüs, WLAN, Akku, Uhr (Europe/Zurich)
│   ├── menu/                Dropdown, Popover (WLAN/Akku/Kalender)
│   ├── menu.config.ts       Menüstruktur als Daten (Einträge → Aktions-ID)
│   ├── actions.ts           zentrale Aktionsliste für Menü, Tastenkürzel, Willkommensfenster
│   ├── shortcuts.ts         Tastenkürzel (Alt+W, Alt+M, …)
│   ├── preferences.ts       Hintergrund, dunkle Fenster (localStorage mit try/catch)
│   ├── Desktop.tsx          Hintergrund, Schreibtisch-Icons, Fensterfläche
│   ├── Window.tsx           Titelleiste, Ampel-Buttons, Drag per Pointer-Events
│   ├── Dock.tsx             App-Icons, Hover-Vergrösserung, Punkt für offene Apps
│   ├── Notification.tsx     Benachrichtigung oben rechts
│   ├── windowStore.ts       Zustand: offen/minimiert/maximiert, x/y, z-Reihenfolge
│   ├── apps.registry.ts     Liste aller Desktop-Apps: id, Titel, Icon, Standardgrösse/-position
│   └── apps/                Ein Ordner pro Desktop-App (Inhalt eines Fensters)
│       ├── welcome/             Willkommensfenster (Startfenster)
│       ├── about/               Über mich.txt
│       ├── finder/              Ordner "Projekte"
│       ├── terminal/            Terminal (Befehle aus shared/terminal.ts)
│       ├── rigged-to-riches/    Steam-Ansicht
│       ├── clipper/             Telegram-Chat
│       ├── ipa-assistent/       Chat mit RAG-Backend
│       ├── agents/              Wochenbericht (PDF-Vorschau)
│       ├── mail/                Kontakt
│       ├── lebenslauf/          PDF-Vorschau
│       ├── wetter/, shop-outreach/   kleine Projekte aus dem Ordner «Projekte»
│       └── about-os/, shortcuts/     «Über Silvan OS», «Tastenkürzel»
├── mobile/                  Handy-Ansicht (unter 860 px) nach design/mobile.dc.html
│   ├── MobileOS.tsx         Home-Bildschirm, Dock, App öffnen/schliessen, Browser-Zurück
│   ├── HomeScreen.tsx, Dock.tsx, AppSheet.tsx, icons.tsx, mobile.css
│   ├── mobileApps.ts        Titel und Farben der Apps, Namen für `open`
│   └── apps/                ein Inhalt pro App (Rtr, Clipper, Ipa, Terminal, …)
├── shared/                  von beiden Ansichten genutzt
│   ├── content.ts           gemeinsame Inhalte (aus data/), Stack, Terminal-Chips
│   ├── terminal.ts          Terminal-Befehle als reine Funktion
│   ├── wallpaper.ts         Hintergrund, localStorage-Key `silvanos-wall`
│   ├── calendar.ts          Kalender-Logik (Europe/Zurich)
│   ├── clock.ts             Uhrzeit und Datum in Europe/Zurich
│   └── useIsMobile.ts, useMediaQuery.ts
├── api/                     fetch-Funktionen für das Backend
├── data/                    statische Fallback-Daten (JSON), solange das Backend fehlt
└── classic/                 "Klassische Ansicht": alles auf einer schlichten Seite
```

Neben `src/`: `functions/api/ipa/ask.ts` ist eine Cloudflare Pages Function (Logik in
`server/ipaAgent.ts`). Sie beantwortet IPA-Fragen auf der Live-Seite als RAG über Silvans
Lernnotizen (Workers AI + Vectorize-Index `ipa-notes`). `scripts/ingest-notes.ts` liest die
Notizen aus `ipa-assistant/lernunterlagen/` ein. Die Notizen kommen nie ins Repo oder auf die
Website, und der Assistent gibt sie nicht wörtlich heraus.

Regeln:
- Neue App = neuer Ordner in `desktop/apps/` + Eintrag in `desktop/apps.registry.ts` (Desktop) bzw. Datei in
  `mobile/apps/` + Eintrag in `mobile/mobileApps.ts` und `MobileOS.tsx` (Handy).
- Texte nur in `data/*.json` pflegen. Beide Ansichten lesen über `shared/content.ts`.
- Neuer Terminal-Befehl = ein Eintrag in `shared/terminal.ts` (gilt für Desktop und Handy).
- Neuer Menüeintrag = Aktion in `desktop/actions.ts` + Eintrag in `desktop/menu.config.ts`.
  Menü, Tastenkürzel und Buttons rufen nur Aktionen auf, keine eigene Logik.
- Kein UI-Framework für Fenster (kein react-rnd o. ä.). Drag selbst mit Pointer-Events.
- Unter 860 px Breite: nur die Handy-Ansicht (`mobile/`), ab 860 px nur der Desktop. Umschalten
  live per `useIsMobile`, beide Ansichten per `React.lazy` geladen.
- Design-Vorlagen: `design/desktop.dc.html` und `design/mobile.dc.html` (Referenz, kein Code).
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
│                POST /api/agents/report   Agents liefern ihn ab (Header X-Api-Key)
├── ipa/         POST /api/ipa/ask         Frage an den Lernassistenten (Rate-Limit!),
│                                          leitet an das separate Projekt ipa-assistant weiter
└── config/      CORS, Cache (Caffeine), Security für API-Keys
```

Regeln:
- Java 21, Spring Boot 4, Maven. Records für DTOs.
- Postgres für Verlauf (Clips pro Tag, Berichte). Flyway für Migrationen.
- Externe APIs nie pro Request abfragen: Scheduler + Cache.
- `/api/ipa/ask`: Rate-Limit pro IP (Bucket4j), max. Länge der Frage, Timeout.
  Den RAG selbst (LLM, Embeddings, Notizen) gibt es nur im Projekt `ipa-assistant`, nicht hier.
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

# Phase 1: Desktop statisch

Branch `feat/desktop` → `main`

## Worum geht's

Das Frontend steht: Die Seite sieht aus wie ein Mac-Desktop mit Menüleiste, Schreibtisch-Icons,
verschiebbaren Fenstern, Dock, Terminal und einer Benachrichtigung vom Clipper Bot. Alle elf
Fenster aus der Design-Referenz (`docs/design/desktop-reference.dc.html`) sind umgesetzt. Die
Inhalte kommen aus `frontend/src/data/*.json`. Ein Backend gibt es noch nicht (Phase 2).

## Was drin ist

- **Setup:** Vite, React 19, TypeScript 6.0, ESLint 9 (typescript-eslint, react-hooks, jsx-a11y),
  Prettier, Vitest mit Testing Library. Schriften (Inter, JetBrains Mono) liegen lokal über
  `@fontsource`, es gibt also keine Anfrage an Google Fonts.
- **Menüleiste:** Name der aktiven App (vorderstes nicht minimiertes Fenster), Uhr in
  `Europe/Zurich`, jede Sekunde aktualisiert. Dazu ein Link «Klassische Ansicht».
- **Fenster** (`os/Window.tsx` + `os/windowStore.ts`): Drag mit Pointer-Events auf der
  Titelleiste, ohne Library. Fokus über die z-Reihenfolge, Schliessen, Minimieren (Inhalt bleibt
  erhalten), Maximieren. Beim Drag bleibt das Fenster unter der Menüleiste und mindestens 140 px
  sichtbar.
- **Dock:** Hover-Vergrösserung und ein Punkt für offene Apps, auch für minimierte. Ein Klick
  holt ein minimiertes Fenster zurück.
- **Apps:** Über mich, Projekte (Finder), Terminal, Rigged to Riches, Clipper (Telegram),
  IPA-Assistent (Beispielfragen mit Quelle), Wochenbericht, Mail, Lebenslauf, Wetterstation,
  shop-outreach. Ein Ordner pro App, alle in `apps.registry.ts` eingetragen.
- **Terminal:** Befehlstabelle in `apps/terminal/commands.ts` mit `help whoami skills motto ls
  projekte open curl clear exit` (dazu `sudo` aus der Referenz). Verlauf mit ↑/↓ (max. 20),
  Ausgabe auf 40 Zeilen begrenzt. `open <name>` öffnet die App.
- **Benachrichtigung:** erscheint nach 4 s, wenn der Clipper-Chat zu ist, und verschwindet nach
  14 s. Ein Klick öffnet den Chat.
- **Mobile (< 860 px):** Fenster stehen untereinander, ohne Drag und ohne Maximieren. Ein neu
  geöffnetes Fenster wird in den Blick gescrollt.
- **Klassische Ansicht** (`#klassisch`): alle Inhalte auf einer schlichten Seite, mit denselben
  JSON-Daten.

## Abweichungen von der Referenz und bewusste Entscheide

- **Ampel-Buttons:** Sie sehen aus wie in der Referenz (12-px-Punkte im Abstand von 26 px). Die
  unsichtbare Klickfläche ist **26 × 44 px**. Für 44 × 44 px müssten die Punkte weiter
  auseinander stehen, sonst überlappen die Flächen. Das erfüllt WCAG 2.5.8 (24 px), aber nicht die
  44-px-Regel aus CLAUDE.md. → Bitte entscheiden, ob die Punkte weiter auseinander sollen.
- **Dock auf kleinen Handys:** bricht um, statt seitlich zu scrollen, damit kein Icon halb
  abgeschnitten ist.
- **Menüleiste unter 480 px:** Datum und WLAN-Symbol werden ausgeblendet, die Uhrzeit bleibt.
- **Terminal:** ↓ geht im Verlauf wieder nach vorne (die Referenz kennt nur ↑). `ls projekte`
  funktioniert auch als `ls Projekte/`.
- **Maximieren** ist in der Mobile-Ansicht deaktiviert (grauer Punkt).
- **Schliessen und wieder öffnen** setzt ein Fenster auf seine Standardposition zurück. Ein
  geschlossenes Terminal startet leer.
- **Tooling:** Das aktuelle Vite-Template bringt oxlint mit. Ich habe es durch ESLint ersetzt.
  TypeScript ist auf `~6.0` festgesetzt, weil typescript-eslint TS 7 noch nicht unterstützt.
  ESLint bleibt auf 9, weil eslint-plugin-jsx-a11y ESLint 10 noch nicht unterstützt.
- **`.gitattributes`** erzwingt LF, sonst schlägt `prettier --check` unter Windows fehl.

## Platzhalter (bleiben, bis echte Daten da sind)

`[live]`, `[Datum]`, `[KW]`, `[Views]`, `[Zeit]`, `[Sek.]`, `[Streamer A]`, `[Clip 0:23]`,
`[Sprache]`, `[LLM]`, `[Vektor-DB]`, `[deine@email.ch]`, `[Trailer, …]`,
`[Lebenslauf als PDF einbetten]`, `[Foto / Dashboard-Screenshot]`,
`[Was der Agent für nächste Woche vorschlägt]`. GitHub und LinkedIn verlinken noch auf die
Startseiten, «Auf die Wunschliste» und «PDF herunterladen» auf `#steam` bzw. `#lebenslauf`.

## Tests

80 Tests in 11 Dateien (Vitest + Testing Library):

- `windowStore`: open/close/focus/minimize/maximize/move, z-Reihenfolge, aktive App, Drag-Grenzen
- `commands`: jeder Befehl, Aliase für `open`, unbekannte Befehle, Verlauf ↑/↓, Status-Format
- Komponenten: Uhr (Zeitzone, Sommer-/Winterzeit, Tick), Window (Ampel, Drag, schmal,
  minimiert), Dock, Desktop-Icons, Terminal (Eingabe, Verlauf, clear, exit, open), Apps
- Integration: Start-Fenster, Öffnen über Dock und Terminal, Benachrichtigung (Zeitpunkte, Klick,
  Schliessen, unterdrückt bei offenem Chat), Mobile-Layout und Resize, Klassische Ansicht hin und
  zurück

## Prüfen

```bash
cd frontend
npm ci
npm run build && npm run test && npm run lint
npm run dev   # http://localhost:5173, dann z. B. «help» im Terminal tippen
```

Ich habe es in Chrome bei 1440 × 900, 390 px und 360 px angeschaut. Noch offen ist ein Test auf
einem echten Handy (Touch-Drag ist dort ohnehin aus).

## Nicht in diesem PR

Backend und `/api/status` (Phase 2), CI-Workflow (Phase 2), Deployment (Phase 3).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

# Dock, Menüleiste und Willkommensfenster

Branch `feat/menubar-dock-welcome` → `main`

## Worum geht's

Drei Verbesserungen am Desktop:

1. Das Dock vergrössert die Icons wie bei macOS, ohne sie abzuschneiden.
2. Jeder Eintrag in der Menüleiste tut etwas.
3. Ein Willkommensfenster macht beim ersten Laden sofort klar, dass das ein Portfolio ist.

## 1. Dock

- Die Icons wachsen beim Hovern nach oben aus dem Dock heraus (`transform-origin: bottom`).
  Im Desktop-Modus schneidet kein `overflow` mehr ab.
- Die Vergrösserung hängt vom Mausabstand ab (bis 1.6×, weicher Kosinus-Abfall). Nachbarn
  wachsen leicht mit, und ihr Platz wächst mit, damit sich nichts überlappt. Die Werte
  kommen direkt als CSS-Variable ans Element, ohne Re-Render pro Mausbewegung.
- Ein Tooltip mit dem App-Namen steht über dem vergrösserten Icon, auch bei Tastaturfokus.
- Das Dock bleibt immer über den Fenstern. Die Fenster liegen in einer eigenen Stapel-Ebene
  (`isolation: isolate`), ihre wachsenden z-Werte überholen das Dock nie.
- `prefers-reduced-motion`: keine Vergrösserung, nur der Tooltip.
- Mobile: Das Dock scrollt horizontal (`scroll-snap`), ohne Vergrösserung und ohne Tooltip.

## 2. Menüleiste

**Aufbau:** Alle Einträge rufen Aktionen aus **`os/actions.ts`** auf, das ist die zentrale
Liste für Menü, Tastenkürzel und Willkommensfenster. Die Struktur kommt aus
**`os/menu.config.ts`**: Einträge, Trenner, Häkchen und deaktivierte Zustände sind Daten,
nichts ist in der Komponente fest verdrahtet.

| Menü | Einträge |
|---|---|
| Logo | Über Silvan OS (Version, Stack, `[GitHub-Repo]`), Klassische Ansicht, Neu starten … (Bootscreen, Desktop wieder im Startzustand) |
| Ablage | Neues Terminal-Fenster, Lebenslauf öffnen, Lebenslauf herunterladen (PDF), Fenster schliessen ⌥W |
| Bearbeiten | E-Mail-Adresse kopieren, Link zu dieser Seite kopieren (Toast «Kopiert») |
| Darstellung | 4 Hintergründe (Aurora, Nacht, Abendrot, Graphit), Dunkle Fenster, Vollbild |
| Fenster | Minimieren ⌥M, Alle minimieren, Fenster anordnen (Kacheln), Liste der offenen Fenster mit Häkchen |
| Hilfe | Terminal-Befehle (öffnet das Terminal und führt `help` aus), Tastenkürzel, Kontakt |

**Rechts in der Leiste:**
- **WLAN:** Backend online mit Antwortzeit von `/api/status`, sonst «Offline-Modus, zeige
  gespeicherte Daten», dazu der Knopf «Erneut prüfen».
- **Akku:** «Lehrjahr [x] von 4» mit Fortschrittsbalken. Der Wert ist eine Konstante in
  `data/apprenticeship.ts` und noch ein Platzhalter.
- **Uhr:** Kalender des aktuellen Monats (Zürcher Datum) und kommende Termine aus
  `data/events.json`.

**Bedienung:** Ein Klick öffnet ein Menü, solange eines offen ist, wechselt Hover zum nächsten.
Ein Klick ausserhalb oder Esc schliesst, dann geht der Fokus zurück zum Auslöser. Mit
←/→ wechselt man das Menü, mit ↑/↓, Home und End navigiert man im Menü, deaktivierte Einträge
werden übersprungen. Die Leiste hat nur einen Tab-Stopp (roving tabindex). Rollen:
`menubar`, `menu`, `menuitem`, `menuitemradio`, `menuitemcheckbox`, `separator`. Die Popover
haben `role="dialog"`.

**Tastenkürzel:** Alt/Option + W schliesst das aktive Fenster, Alt/Option + M minimiert es.
Cmd/Ctrl + W/M wird auch versucht. Solange ein Eingabefeld den Fokus hat, greifen die Kürzel
nicht.

**Einstellungen:** Hintergrund und dunkle Fenster liegen in `localStorage`, jeder Zugriff
läuft in try/catch. Sie überstehen einen Neustart. Ohne Speicher gilt die Auswahl bis zum
Neuladen.

## 3. Willkommensfenster

- Es ersetzt «Über mich.txt» als Startfenster: 800 px breit, horizontal zentriert, vorne. Es
  ploppt nach 300 ms auf, bei Reduced Motion sofort.
- **Inhalt:**
  - «Portfolio von Silvan Brors» und «Applikationsentwickler EFZ · ti&m · Zürich»
  - der Intro-Text mit hervorgehobenen Keywords
  - vier Projektkarten mit Icon, einem Satz (aus der README) und dem Button «Öffnen»
  - Live-Zahlen aus `/api/status` mit Fallback auf `data/`
  - die Buttons «Lebenslauf», «Kontakt» und «Klassische Ansicht»
  - der Hinweis zum Verschieben und zum Terminal. Mobil ist er ausgeblendet, weil man dort
    nichts verschieben kann.
- **Start:** Sonst ist nur das Terminal im Hintergrund offen. Finder und «Über mich.txt»
  erreicht man über die Schreibtisch-Icons. Im Terminal geht auch `open willkommen`.
- **Grösse:** Fenster mit Höhe «auto» wachsen nie unter das Dock, der Inhalt scrollt dann.
- **Mobile:** Das Willkommensfenster steht ganz oben.

## Entscheide (so abgesprochen)

- **Tastenkürzel:** Alt/Option statt Cmd/Ctrl, weil Browser Ctrl+W und Cmd+M meist selbst
  abfangen.
- **«Neues Terminal-Fenster»:** öffnet das Terminal bzw. holt es mit frischer Sitzung nach
  vorne. Mehrere Terminal-Fenster gleichzeitig wären ein grösserer Umbau des Stores.
- **«Dunkle Fenster»:** betrifft die Titelleisten aller Fenster und die eigenen
  Text-Fenster (Willkommen, Über mich, Finder, Mail, Wetterstation, shop-outreach, Über
  Silvan OS, Tastenkürzel). Telegram, Steam und die PDF-Vorschau behalten ihren Look.
- **GitHub-Link:** bleibt Platzhalter `[GitHub-Repo]`, solange das Repo privat ist.
- **«Lebenslauf herunterladen»:** Solange `downloadHref` ein Platzhalter (`#…`) ist, kommt
  der Hinweis «Das PDF ist noch nicht hochgeladen.» statt eines vorgetäuschten Downloads.

## Bekannte Grenzen

- **Klickflächen der Menüleiste:** Sie ist mit der Maus 28 px hoch, wie macOS. Auf
  Touch-Geräten (`pointer: coarse`) werden Leiste und Menüeinträge 44 px hoch. Mobil gibt es
  nur das Logo-Menü, weil die anderen Menüs nicht in die Leiste passen.
- **Kleine Laptops:** Auf 1280 × 720 passt das Willkommensfenster nicht ganz über das Dock.
  Die Buttons unten erreicht man durch Scrollen im Fenster.
- **Version:** `frontend/package.json` steht jetzt auf **0.3.0** und wird in «Über Silvan OS»
  angezeigt.

## Tests

163 Tests in 19 Dateien (vorher 92):

- **Menü:** öffnen und schliessen (Klick, Esc, ausserhalb, zweiter Klick), Hover-Wechsel,
  Pfeiltasten, Home/End, Nachbarmenü, Enter, deaktivierte Einträge, nur ein Tab-Stopp,
  Fensterliste mit Häkchen, Häkchen bei Hintergrund und dunklen Fenstern, Popover für WLAN,
  Akku und Kalender.
- **Aktionen:** alle Aktionen aus `createActions`, auch Kopieren (Erfolg und Fehler),
  Download-Platzhalter und Einstellungen.
- **Store:** `minimizeAll`, `tile`/`tileLayout` (keine Überlappung, über dem Dock, Umbruch in
  Reihen, minimierte bleiben, Maximieren wird aufgehoben).
- **App-Integration:** Alle minimieren, Fenster anordnen, Fensterliste, Neu starten
  (Bootscreen, Startzustand), Über Silvan OS, Terminal-Befehle (`help` läuft genau einmal),
  neues Terminal, Kopieren mit Toast, Hintergrund und dunkle Fenster bleiben über den Neustart
  erhalten, Alt+W/Alt+M, keine Kürzel im Eingabefeld.
- **Einstellungen:** Speichern und Laden, kaputte Daten, `localStorage` wirft.
- **Kalender:** Zürcher Datum, Monatsraster, Datum nur so genau wie bekannt, kommende Termine.
- **Dock:** Vergrösserung nach Abstand, Reset, Tooltip, keine Vergrösserung bei Reduced Motion
  und mobil.
- **Willkommen:** Startzustand (vorne, Terminal dahinter, 300 ms Verzögerung), Texte,
  Projektkarten öffnen die Apps, Buttons, Live-Zahlen offline und live, Zentrierung.

## Prüfen

```bash
cd frontend
npm run build && npm run test && npm run lint
npm run dev
```

Angeschaut in Chrome bei 1440 × 900, 1280 × 720 und 390 px: Dock-Vergrösserung mit Tooltip,
offenes Menü mit Hintergrund «Nacht» und dunklen Fenstern, Kalender-Popover,
Willkommensfenster.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

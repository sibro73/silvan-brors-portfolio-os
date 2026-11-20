# Fehlende Inhalte

Platzhalter in eckigen Klammern bleiben, bis echtes Material da ist. Nichts wird erfunden.
Dateien kommen nach `frontend/public/media/` und sind danach unter `/media/<datei>` erreichbar.
Grosse Videos besser extern hosten (z. B. YouTube) und nur den Link eintragen.

## Material (Dateien)

| Was | Wo es angezeigt wird | Ablage | Danach zu tun |
|---|---|---|---|
| Lebenslauf als PDF | Fenster «Lebenslauf», Menü «Lebenslauf herunterladen» | `media/lebenslauf.pdf` | Erledigt. Quelle `docs/cv/lebenslauf.html`, Vorschau `media/lebenslauf.webp` (siehe `docs/cv/README.md`). |
| Trailer Rigged to Riches | Fenster «Rigged to Riches» | `media/rtr-trailer.mp4` (kurz, ohne Ton) oder YouTube-Link | Video-Einbindung baue ich, sobald die Datei da ist. |
| Foto oder Dashboard der Wetterstation | Fenster «Wetterstation» | `media/wetterstation.jpg` (oder `.png`) | Bild mit Alternativtext einbinden. |
| Screenshot der Seite fürs README | `README.md` | `docs/screenshot.png` | Erledigt: Screenshot der Live-Seite. |

## Angaben (Text)

| Platzhalter | Datei | Was eintragen |
|---|---|---|
| `[Trailer, läuft automatisch ohne Ton]` | `src/data/projects.json` | ersetzt durch das Video, siehe oben |
| `[Foto / Dashboard-Screenshot]` | `src/data/projects.json` | ersetzt durch das Bild, siehe oben |

## Bleiben bewusst Platzhalter (kommen live vom Backend)

`[live]`, `[Datum]` (Status), `[KW]`, `[Views]`, `[Was der Agent … vorschlägt]` (Wochenbericht),
`[Zeit]`, `[Clip 0:23]`, `[Streamer A]`, `[Sek.]` (Clipper-Chat).
Diese verschwinden, sobald Clipper und Agents Daten schicken. Siehe `docs/api.md`.

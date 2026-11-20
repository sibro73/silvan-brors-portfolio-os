## Phase 6: Feinschliff

Alles, was ohne zusätzliches Material geht. Fotos, Trailer, Lebenslauf und den Live-Link
kann ich erst einbauen, wenn sie da sind (`docs/inhalte.md`).

### Änderungen
- **Meta-Tags** in `index.html`: `canonical`, Open Graph (Titel, Beschreibung, Bild 1200×630,
  `de_CH`), `twitter:card`, `theme-color`. Dazu `robots.txt` und `sitemap.xml`.
- **Vorschaubild und Icons:** `og-image.png` (Desktop-Look mit Name und Rolle, ohne Zahlen und ohne
  Platzhalter), `apple-touch-icon.png` und `favicon-32.png`. Gerendert mit headless Chrome aus
  HTML-Vorlagen in `docs/og/`, mit Anleitung zum Neu-Erzeugen.
- **Barrierefreiheit:** Die Buttons «Öffnen» im Willkommensfenster hatten zu wenig Kontrast
  (4.27:1). Sie nutzen jetzt `--link-strong` aus `windowTheme.css`, das auch bei «Dunkle Fenster»
  genug Kontrast hat. Dort war es vorher ebenfalls zu wenig.
- **Schriften:** nur noch der Latin-Zeichensatz. Das CSS-Bundle schrumpft von 57 auf 27 kB.
- **Lighthouse** (`docs/lighthouse.md`), Median aus je 3 Läufen:
  - Barrierefreiheit: 97 → 100.
  - Desktop: Performance 100, Best Practices 100, SEO 100.
  - Mobil: Die Performance schwankt je nach CPU-Last zwischen 75 und 94. FCP und LCP sind unverändert.
    Die Doku sagt das offen und nennt, was noch helfen würde (`React.lazy`).
- **README:** Screenshot vom lokalen Build, Architektur als Mermaid-Diagramm, Stack, Tests und Links zur Doku.
- **`docs/inhalte.md`:** alle offenen Platzhalter mit der Datei und dem, was einzutragen ist. Die Ablage
  für Medien ist `frontend/public/media/`.

### Tests
- Frontend: Lint, 178 Tests und Build grün. Vorschaubild, Icons und Screenshot habe ich angeschaut.

### Offen
- [ ] Material: Lebenslauf-PDF, Trailer, Foto der Wetterstation (`docs/inhalte.md`)
- [ ] Live-Link im README, sobald die Seite läuft

🤖 Generated with [Claude Code](https://claude.com/claude-code)

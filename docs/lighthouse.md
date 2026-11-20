# Lighthouse

Gemessen am 20.11.2026, Lighthouse 12, lokaler Produktions-Build (`npm run build` + `vite preview`),
headless Chrome. Mobil mit der Standard-Drosselung (langsames 4G, 4× langsamere CPU), Desktop mit
`--preset=desktop`. Pro Stand drei Läufe, angegeben ist der **Median**.

`vite preview` liefert die Header aus `public/_headers` nicht aus. Die CSP und das Caching von
Cloudflare Pages sind hier also nicht mit gemessen.

| Stand | Gerät | Performance (3 Läufe) | Barrierefreiheit | Best Practices | SEO | FCP | LCP | TBT |
|---|---|---|---|---|---|---|---|---|
| vorher | Mobil | 92 (75 / 93 / 92) | 97 | 100 | 100 | 2.6 s | 2.7 s | 113 ms |
| vorher | Desktop | 100 (98 / 100 / 100) | 97 | 100 | 100 | 0.5 s | 0.6 s | 0 ms |
| nachher | Mobil | 86 (94 / 85 / 86) | 100 | 100 | 100 | 2.5 s | 2.7 s | 283 ms |
| nachher | Desktop | 100 (100 / 100 / 100) | 100 | 100 | 100 | 0.5 s | 0.6 s | 32 ms |
| Handy-Ansicht | Mobil | **95** (95 / 95 / 95) | 100 | 100 | 100 | 2.3 s | 2.4 s | 0 ms |
| Handy-Ansicht | Desktop | 100 (100 / 100 / 100) | 100 | 100 | 100 | 0.6 s | 0.6 s | 0 ms |

«Handy-Ansicht» = Stand nach PR #14–#16: eigene Handy-Ansicht unter 860 px, Desktop und Handy
per `React.lazy` getrennt geladen. Lighthouse misst mobil mit 412 px Breite, also die
Handy-Ansicht (grösstes Element: das Profil-Widget), am Desktop die Computer-Ansicht.

## Was geändert wurde

- **Kontrast (Barrierefreiheit 97 → 100):** Die Buttons «… öffnen» im Willkommensfenster hatten
  4.27:1 (`#2f6fe4` auf `#f5f5f7`). Jetzt nutzen sie `--link-strong` aus `windowTheme.css`:
  `#1c55c0` auf hellen und `#79aaff` auf dunklen Fenstern. Bei «Dunkle Fenster» war der Kontrast
  vorher ebenfalls zu tief.
- **Schriften:** nur noch der Latin-Zeichensatz von Inter und JetBrains Mono, der ä/ö/ü, «» und –
  enthält. Das CSS-Bundle schrumpft von 57 auf 27 kB, und es gibt weniger Schriftdateien.

## Ehrlich zur Performance

Mobil schwankt die Performance zwischen den Läufen stark, von 75 bis 94. Grund ist die Total
Blocking Time, die von der CPU-Last des Messrechners abhängt. FCP und LCP sind vorher und
nachher praktisch gleich. Die kleineren Schriften bringen in diesem Rauschen **keine messbare**
Verbesserung. Der Median «92 → 86» ist darum kein echter Rückschritt, aber auch kein Gewinn.

**Mit der Handy-Ansicht:** mobil 95 statt 86, die Total Blocking Time fällt von 283 ms auf 0 ms.
Das Handy lädt nur noch seinen eigenen Code (32 kB) statt den ganzen Desktop. Ungenutztes
JavaScript beim Start: rund 31 kB statt 43 kB.

Was mobil noch helfen würde, aber nicht umgesetzt ist:
- **Apps erst bei Bedarf laden:** Innerhalb der Handy-Ansicht liegen alle zwölf Apps im selben
  Chunk.
- Die Seite rendert erst nach dem JavaScript. Ein statischer erster Bildschirm in `index.html`
  würde FCP verkürzen.

Neu messen: `npm run build && npx vite preview --port 4190`, dann
`npx lighthouse@12 http://localhost:4190/` (Desktop zusätzlich mit `--preset=desktop`).

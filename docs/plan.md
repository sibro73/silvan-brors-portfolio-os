# Umsetzungsplan

Jede Phase = ein Branch + ein PR. Erst weiter, wenn die Phase online läuft.

## Phase 1 – Desktop statisch (`feat/desktop`)
- [x] Vite + React + TypeScript in `frontend/` aufsetzen, ESLint, Prettier, Vitest
- [x] Menüleiste mit Uhr (Europe/Zurich) und Name der aktiven App
- [x] Hintergrund und Schreibtisch-Icons
- [x] `Window` mit Drag, Fokus (z-Reihenfolge), Schliessen, Minimieren, Maximieren
- [x] Dock mit Hover-Effekt und Punkt für offene Apps
- [x] Alle Apps aus der Design-Referenz mit Daten aus `data/*.json`
- [x] Terminal: Eingabe, Verlauf mit Pfeil nach oben, Befehle `help whoami skills motto ls projekte open curl clear exit`
- [x] Benachrichtigung vom Clipper Bot
- [x] Mobile-Ansicht (Fenster gestapelt) und "Klassische Ansicht"
- [x] Tests: windowStore, Terminal-Befehle

## Phase 2 – Backend MVP (`feat/backend-status`)
- [x] Spring Boot 4 / Java 21 in `backend/` (Spring Initializr: Web, Validation, Actuator, Cache)
- [x] `GET /api/status` mit Testdaten, Test mit MockMvc
- [x] CORS für die Frontend-Domain
- [x] Dockerfile + `docker-compose.yml` (backend + postgres)
- [x] GitHub Actions: Tests für frontend und backend bei jedem PR
- [x] Frontend holt `/api/status`, Fallback auf `data/`

## Phase 3 – Deployment (`chore/deploy`)
- [x] Frontend auf Vercel oder Cloudflare Pages (Cloudflare Pages, live seit 20.11.2026)
- [x] Backend live: Cloudflare Pages Functions + D1 (gratis), gleiche API wie Spring Boot.
  Das Spring-Backend läuft lokal und in der CI.
- [x] Domain einrichten: silvanbrors.ch bei Hostpoint, DNS bei Cloudflare, `www` leitet weiter
  (API unter derselben Domain, `/api/…`)
- [x] Deploy automatisch nach Merge auf `main` (Seite und Functions zusammen)

## Phase 4 – Echte Daten (`feat/live-data`)
- [x] `POST /api/clipper/events` mit API-Key, Clipper anbinden
  (live: der Clipper meldet jeden gesendeten Clip, Key in seiner `.env`)
- [x] Postgres + Flyway: Clips pro Tag speichern
- [ ] Steam: prüfen, was die Steamworks-API liefert (Wishlists/Follower), Scheduler + Cache
  (geprüft, siehe `docs/steam.md`: braucht Financial-API-Key, Endpunkt noch unbestätigt)
- [x] Agents: Wochenbericht speichern und über `/api/agents/report` ausliefern
  (`rtr-marketing`: `loop-analyst` schreibt `reports/*.portfolio.json`, `scripts/portfolio_report.py` sendet)

## Phase 5 – IPA-Demo live (`feat/ipa-ask`)
- [x] `POST /api/ipa/ask` an das RAG anbinden
  (lokal an `ipa-assistant`. Live-Seite: RAG über die Notizen auf Cloudflare (Workers AI + Vectorize),
  die Notizen selbst werden nicht veröffentlicht, siehe `docs/deploy.md` → 6)
- [x] Rate-Limit, Längenlimit, Timeout, Fehlermeldung im Chat
- [x] Quellen (welche Notiz) in der Antwort mitliefern

## Phase 6 – Feinschliff (`chore/polish`)
- [ ] Echte Screenshots, GIFs, Trailer, Lebenslauf-PDF
  (vorbereitet: `docs/inhalte.md`, Ablage `frontend/public/media/`, Lebenslauf-Vorlage `docs/cv/`.
  Offen: das Material selbst)
- [x] Meta-Tags, Open-Graph-Bild für LinkedIn, Favicon
- [x] Lighthouse: Performance und Barrierefreiheit prüfen (`docs/lighthouse.md`)
- [x] README mit Screenshot, Architektur und Link zur Live-Seite

## Phase 7 – Handy-Ansicht (`feat/mobile-os`)
- [x] Unter 860 px eigene Handy-Ansicht nach `design/mobile.dc.html`, ab 860 px nur der Desktop
- [x] Live-Umschalten per `matchMedia`, beide Ansichten mit `React.lazy`
- [x] Gemeinsame Inhalte (`shared/content.ts`), Terminal-Logik und Hintergrund (`silvanos-wall`)
- [x] Apps zoomen aus dem Icon, Browser-Zurück schliesst, Wackel-Modus, Animationen nur ohne
  `prefers-reduced-motion`

## Phase 8 – Inhalte und Live-Daten (PR #18–#22)
- [x] Lebenslauf als PDF mit echten Angaben, Vorschau in beiden Ansichten, E-Mail überall
- [x] Zweite Seite am Handy (Live-Zahlen, Termin, Wochenbericht, Links)
- [x] Live-Backend gratis auf Cloudflare: Pages Functions + D1, gleiche API wie Spring Boot
- [x] «Über das Projekt» bei allen Projekten, Technologien als Chips, GitHub-Links
  (Clipper, shop-outreach und diese Seite sind öffentlich)
- [x] Startseite als App (Dock am Desktop, App am Handy)

## Was noch fehlt (nur mit Silvan)
- Trailer von Rigged to Riches (`media/rtr-trailer.mp4` oder YouTube-Link)
- Foto oder Dashboard der Wetterstation, dazu mehr Text (Sensoren, Technik, eigene Rolle)
- Steam-Wishlists: in Steamworks prüfen, ob ein Financial API Key die Zahlen liefert (`docs/steam.md`)
- Clipper starten: Er meldet Clips, sobald er läuft (Key steht in seiner `.env`)

## Offene Punkte
- ~~Sprache des Clippers~~: Python (FFmpeg, Whisper, Telegram Bot API)
- LLM und Vektor-DB des IPA-Assistenten: lokal Ollama `llama3.1:8b` + pgvector (`ipa-assistant`),
  live Llama 3.3 70B + bge-m3 + Cloudflare Vectorize
- Datenbank in Produktion: Cloudflare D1, siehe `docs/deploy.md`
- Domain: silvanbrors.ch (live), API unter silvanbrors.ch/api (Pages Functions)
- DNSSEC: bei Cloudflare eingeschaltet, CDS ist veröffentlicht. Die .ch-Registry übernimmt den
  Schlüssel automatisch, wenn er ein paar Tage stabil war. Sonst DS bei Hostpoint eintragen.

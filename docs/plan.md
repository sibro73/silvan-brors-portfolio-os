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
- [ ] Backend auf VPS (Docker) oder Fly.io, HTTPS
  (vorbereitet: `backend/fly.toml`, `docs/deploy.md`. Offen: Fly.io braucht eine Kreditkarte, Neon-Konto)
- [x] Domain einrichten: silvanbrors.ch bei Hostpoint, DNS bei Cloudflare, `www` leitet weiter
  (`api.` folgt mit dem Backend)
- [x] Deploy automatisch nach Merge auf `main` (Frontend; Backend mit `BACKEND_DEPLOY_ENABLED`)

## Phase 4 – Echte Daten (`feat/live-data`)
- [ ] `POST /api/clipper/events` mit API-Key, Clipper anbinden
  (Endpunkt fertig, der Clipper meldet Clips, sobald `PORTFOLIO_API_URL`/`PORTFOLIO_API_KEY` in seiner `.env`
  stehen. Offen: braucht das Backend live)
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

## Offene Punkte
- ~~Sprache des Clippers~~: Python (FFmpeg, Whisper, Telegram Bot API)
- LLM und Vektor-DB des IPA-Assistenten: lokal Ollama `llama3.1:8b` + pgvector (`ipa-assistant`),
  live Llama 3.3 70B + bge-m3 + Cloudflare Vectorize
- Datenbank in Produktion: Neon (Free-Plan), siehe `docs/deploy.md`
- Domain: silvanbrors.ch (live), API später unter api.silvanbrors.ch (Fly.io, siehe `docs/deploy.md`)
- DNSSEC: bei Cloudflare eingeschaltet, wartet auf den DS-Eintrag bei der .ch-Registry

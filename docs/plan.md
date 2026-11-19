# Umsetzungsplan

Jede Phase = ein Branch + ein PR. Erst weiter, wenn die Phase online läuft.

## Phase 1 – Desktop statisch (`feat/desktop`)
- [ ] Vite + React + TypeScript in `frontend/` aufsetzen, ESLint, Prettier, Vitest
- [ ] Menüleiste mit Uhr (Europe/Zurich) und Name der aktiven App
- [ ] Hintergrund und Schreibtisch-Icons
- [ ] `Window` mit Drag, Fokus (z-Reihenfolge), Schliessen, Minimieren, Maximieren
- [ ] Dock mit Hover-Effekt und Punkt für offene Apps
- [ ] Alle Apps aus der Design-Referenz mit Daten aus `data/*.json`
- [ ] Terminal: Eingabe, Verlauf mit Pfeil nach oben, Befehle `help whoami skills motto ls projekte open curl clear exit`
- [ ] Benachrichtigung vom Clipper Bot
- [ ] Mobile-Ansicht (Fenster gestapelt) und "Klassische Ansicht"
- [ ] Tests: windowStore, Terminal-Befehle

## Phase 2 – Backend MVP (`feat/backend-status`)
- [ ] Spring Boot 3 / Java 21 in `backend/` (Spring Initializr: Web, Validation, Actuator, Cache)
- [ ] `GET /api/status` mit Testdaten, Test mit MockMvc
- [ ] CORS für die Frontend-Domain
- [ ] Dockerfile + `docker-compose.yml` (backend + postgres)
- [ ] GitHub Actions: Tests für frontend und backend bei jedem PR
- [ ] Frontend holt `/api/status`, Fallback auf `data/`

## Phase 3 – Deployment (`chore/deploy`)
- [ ] Frontend auf Vercel oder Cloudflare Pages
- [ ] Backend auf VPS (Docker) oder Fly.io, HTTPS
- [ ] Domain einrichten (z. B. silvanbrors.ch), `api.` als Subdomain
- [ ] Deploy automatisch nach Merge auf `main`

## Phase 4 – Echte Daten (`feat/live-data`)
- [ ] `POST /api/clipper/events` mit API-Key, Clipper anbinden
- [ ] Postgres + Flyway: Clips pro Tag speichern
- [ ] Steam: prüfen, was die Steamworks-API liefert (Wishlists/Follower), Scheduler + Cache
- [ ] Agents: Wochenbericht speichern und über `/api/agents/report` ausliefern

## Phase 5 – IPA-Demo live (`feat/ipa-ask`)
- [ ] `POST /api/ipa/ask` an das RAG anbinden
- [ ] Rate-Limit, Längenlimit, Timeout, Fehlermeldung im Chat
- [ ] Quellen (welche Notiz) in der Antwort mitliefern

## Phase 6 – Feinschliff (`chore/polish`)
- [ ] Echte Screenshots, GIFs, Trailer, Lebenslauf-PDF
- [ ] Meta-Tags, Open-Graph-Bild für LinkedIn, Favicon
- [ ] Lighthouse: Performance und Barrierefreiheit prüfen
- [ ] README mit Screenshot, Architektur und Link zur Live-Seite

## Offene Punkte
- Sprache des Clippers: [eintragen]
- LLM und Vektor-DB des IPA-Assistenten: [eintragen]
- Domain: [eintragen]

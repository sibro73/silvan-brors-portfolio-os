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
- [ ] Frontend auf Vercel oder Cloudflare Pages
- [ ] Backend auf VPS (Docker) oder Fly.io, HTTPS
- [ ] Domain einrichten (z. B. silvanbrors.ch), `api.` als Subdomain
- [ ] Deploy automatisch nach Merge auf `main`

## Phase 4 – Echte Daten (`feat/live-data`)
- [ ] `POST /api/clipper/events` mit API-Key, Clipper anbinden
  (Endpunkt fertig, Doku: `docs/api.md`. Offen: der Clipper selbst muss ihn aufrufen)
- [x] Postgres + Flyway: Clips pro Tag speichern
- [ ] Steam: prüfen, was die Steamworks-API liefert (Wishlists/Follower), Scheduler + Cache
  (geprüft, siehe `docs/steam.md`: braucht Financial-API-Key, Endpunkt noch unbestätigt)
- [x] Agents: Wochenbericht speichern und über `/api/agents/report` ausliefern

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
- Datenbank in Produktion: Neon (Free-Plan), siehe `docs/deploy.md`
- Domain: silvanbrors.ch, API unter api.silvanbrors.ch (Hosting: Cloudflare Pages + Fly.io, siehe `docs/deploy.md`)

## Phase 3: Deployment

Hosting: Frontend auf **Cloudflare Pages** (`silvanbrors.ch`), Backend auf **Fly.io**
(`api.silvanbrors.ch`). Nach einem Merge auf `main` wird automatisch deployt.

### Änderungen
- `backend/fly.toml`: App `silvan-os-api` in Region `fra`, nur HTTPS, Health-Check auf
  `/actuator/health`, 512 MB. Ohne Besucher schläft das Backend (`min_machines_running = 0`),
  damit fast keine Kosten anfallen. CORS erlaubt `https://silvanbrors.ch` und `https://www.silvanbrors.ch`.
- `application.properties`: `server.forward-headers-strategy=framework`, weil Fly als Proxy davor sitzt.
- `frontend/public/_headers`: CSP (`connect-src` nur auf `api.silvanbrors.ch`), `nosniff`,
  Referrer- und Permissions-Policy, kein Framing. Assets werden ein Jahr gecacht.
  Die CSP wurde lokal in headless Chrome geprüft. Ergebnis: keine Verstösse, und Desktop,
  Dock und Willkommensfenster werden angezeigt.
- Workflows: ein neuer Job `deploy` nach grünen Tests, nur auf `main` und nur wenn
  `vars.DEPLOY_ENABLED == 'true'`. Das Frontend wird mit `VITE_API_URL=https://api.silvanbrors.ch`
  gebaut und mit `wrangler pages deploy` hochgeladen, das Backend geht mit `flyctl deploy --remote-only`.
  Läuft auf `main` schon ein Deploy, wird er nicht abgebrochen. Zusätzlich lässt sich der Deploy
  mit `workflow_dispatch` von Hand starten.
- `docs/deploy.md`: einmalige Einrichtung (Domain, Pages, Fly, Secrets), Prüfen und Rollback.

### Noch offen (Handarbeit, siehe `docs/deploy.md`)
- [ ] Domain registrieren, Nameserver auf Cloudflare
- [ ] Pages-Projekt `silvan-os` + Custom Domains
- [ ] Fly-App `silvan-os-api`, erster Deploy, Zertifikat für `api.`
- [ ] Secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `FLY_API_TOKEN` und Variable `DEPLOY_ENABLED=true`

Die Checkliste für Phase 3 in `docs/plan.md` hake ich erst ab, wenn die Seite live läuft.

### Tests
- Frontend: Lint, 163 Tests und Build grün
- Backend: `./mvnw verify` grün
- actionlint wurde nicht ausgeführt, weil Docker nicht lief. Die YAML-Syntax habe ich mit Python geprüft.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

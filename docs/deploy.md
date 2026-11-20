# Deployment

| Teil | Wo | Adresse |
|---|---|---|
| Frontend | Cloudflare Pages, Projekt `silvan-os` | https://silvanbrors.ch (Ersatz: `silvan-os.pages.dev`) |
| Backend | Fly.io, App `silvan-os-api`, Region `fra` | https://api.silvanbrors.ch (Ersatz: `silvan-os-api.fly.dev`) |
| Datenbank | Neon (Postgres, Free-Plan), Region Frankfurt | nur für das Backend |

Nach jedem Merge auf `main` laufen `.github/workflows/frontend.yml` und `backend.yml`.
Sind die Tests grün, folgt der Job `deploy`, aber nur für den Teil, der sich geändert hat.
Der Job läuft nur, wenn die Repo-Variable `DEPLOY_ENABLED` auf `true` steht. Ohne sie
bleibt `main` grün, auch wenn die Konten noch fehlen.

## Kosten

- **Cloudflare Pages:** gratis.
- **Fly.io:** Abrechnung nach Verbrauch, eine Kreditkarte ist nötig. Das Backend schläft,
  wenn niemand es braucht (`auto_stop_machines`, `min_machines_running = 0` in
  `backend/fly.toml`). Eine schlafende Maschine kostet nur den Speicher ihres Images.
  Die aktuellen Preise stehen auf https://fly.io/pricing. Kontrolliere nach dem ersten
  Monat die Rechnung unter *Billing*.
- **Neon:** Free-Plan (0.5 GB). Die Datenbank schläft ebenfalls, wenn niemand sie braucht.
- **Domain:** jährliche Gebühr beim Registrar.

Weil das Backend schläft, braucht die erste Anfrage nach einer Pause ein paar Sekunden.
Das Frontend wartet nur 3 s. Ist das Backend bis dahin nicht wach, zeigt die Seite die
gespeicherten Daten aus `frontend/src/data/` (WLAN-Symbol: «Offline-Modus»).

## Einmalig einrichten

### 1. Domain

1. `silvanbrors.ch` bei einem Registrar für `.ch` registrieren. Cloudflare selbst
   verkauft keine `.ch`-Domains.
2. In Cloudflare (Free-Plan) *Add a domain* → `silvanbrors.ch`.
3. Beim Registrar die Nameserver auf die zwei Nameserver setzen, die Cloudflare anzeigt.
   Es kann bis zu 24 h dauern, bis Cloudflare die Domain als *Active* zeigt.

### 2. Cloudflare Pages

1. Pages-Projekt anlegen (einmal lokal, im Ordner `frontend/`):
   ```bash
   npx wrangler login
   npx wrangler pages project create silvan-os --production-branch=main
   ```
2. Dashboard → *Workers & Pages* → `silvan-os` → *Custom domains*:
   `silvanbrors.ch` und `www.silvanbrors.ch` hinzufügen. Die DNS-Einträge setzt Cloudflare selbst.
3. API-Token: *My Profile* → *API Tokens* → *Create Token* → *Custom token*,
   Berechtigung **Account → Cloudflare Pages → Edit**, nur für dein Konto.
4. Die **Account ID** steht im Dashboard rechts auf der Übersichtsseite der Domain.

### 3. Datenbank (Neon)

1. Konto auf https://neon.tech anlegen (Free-Plan), Projekt `silvan-os`,
   Region **AWS Europe Central (Frankfurt)**, nahe bei Fly `fra`.
2. Unter *Connect* die Verbindungsdaten ablesen und für Java umschreiben:
   - `POSTGRES_URL=jdbc:postgresql://<host>/<datenbank>?sslmode=require`
   - `POSTGRES_USER` und `POSTGRES_PASSWORD` einzeln. Im JDBC-URL steht kein Passwort.

   Den Host **ohne** `-pooler` nehmen, also die direkte Verbindung. Flyway braucht sie für die Migrationen.
3. Die Tabellen legt Flyway beim ersten Start des Backends selbst an.

### 4. Fly.io

1. Konto auf https://fly.io anlegen und eine Kreditkarte hinterlegen.
2. `flyctl` installieren (PowerShell):
   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   ```
3. App anlegen, Secrets setzen und das erste Mal deployen (im Ordner `backend/`):
   ```bash
   fly auth login
   fly apps create silvan-os-api
   fly secrets set --stage      POSTGRES_URL='jdbc:postgresql://<host>/<datenbank>?sslmode=require'      POSTGRES_USER='<user>' POSTGRES_PASSWORD='<passwort>'      CLIPPER_API_KEY="$(openssl rand -hex 32)" AGENTS_API_KEY="$(openssl rand -hex 32)"
   fly deploy --ha=false   # nur eine Maschine, Fly legt sonst zwei an
   ```
   Ohne Datenbank startet das Backend nicht. Die beiden Keys brauchen später der Clipper
   und die Agents. Du siehst sie nur in diesem Moment. Notiere sie im Passwort-Manager,
   oder setze sie später mit `fly secrets set` neu.
4. Zertifikat für die Subdomain holen:
   ```bash
   fly certs add api.silvanbrors.ch
   fly certs show api.silvanbrors.ch   # zeigt die nötigen DNS-Einträge
   ```
5. In Cloudflare → *DNS* einen Eintrag `CNAME api → silvan-os-api.fly.dev` anlegen,
   mit Proxy-Status **DNS only** (graue Wolke). Sonst kann Fly das Zertifikat nicht ausstellen.
   Verlangt `fly certs show` zusätzlich einen `_acme-challenge`-Eintrag, diesen ebenfalls setzen.
6. Deploy-Token erzeugen:
   ```bash
   fly tokens create deploy --expiry 8760h   # gilt ein Jahr
   ```

### 5. GitHub

Im Repo unter *Settings* → *Secrets and variables* → *Actions*, oder mit `gh`:

```bash
gh secret set CLOUDFLARE_API_TOKEN     # Token aus Schritt 2.3
gh secret set CLOUDFLARE_ACCOUNT_ID    # Account ID aus Schritt 2.4
gh secret set FLY_API_TOKEN            # Token aus Schritt 4.6
gh variable set DEPLOY_ENABLED --body true
```

Danach den ersten Deploy von Hand starten: *Actions* → `frontend` bzw. `backend` →
*Run workflow* auf `main`. Ab dann geht es bei jedem Merge automatisch.

### 6. IPA-Assistent: bleibt lokal

`ipa-assistant` darf nicht öffentlich sein. Auf der Live-Seite bleibt `IPA_ASSISTANT_URL`
deshalb **leer**, und `VITE_IPA_LIVE` wird beim Frontend-Build nicht gesetzt. Der Chat zeigt
dort nur die Beispielantworten, mit dem Hinweis «Läuft nur lokal». Hier ist nichts zu tun.

Wie man den Chat lokal gegen `ipa-assistant` laufen lässt, steht in `docs/api.md`.

## Prüfen

```bash
curl -i https://api.silvanbrors.ch/actuator/health   # {"status":"UP"}
curl -i https://api.silvanbrors.ch/api/status        # JSON, Werte noch null
curl -I https://silvanbrors.ch                       # Header aus frontend/public/_headers
```

Im Browser auf https://silvanbrors.ch zeigt das WLAN-Popover nach dem Aufwachen
«Backend online · Antwortzeit … ms». Vorher einmal neu laden, falls das Backend noch geschlafen hat.

## Wenn etwas schiefgeht

- **Frontend zurücksetzen:** *Workers & Pages* → `silvan-os` → *Deployments* →
  beim letzten guten Deploy *Rollback*.
- **Backend zurücksetzen:** `fly releases --image` zeigt die alten Images, dann
  `fly deploy --image <image>`.
- **Logs:** `fly logs -a silvan-os-api`, Status: `fly status -a silvan-os-api`.
- **Backend startet nicht:** `fly logs` zeigt meist Flyway- oder Verbindungsfehler.
  `POSTGRES_URL` mit `?sslmode=require` und ohne `-pooler`?
- **Key neu setzen:** `fly secrets set CLIPPER_API_KEY=…` startet das Backend mit dem neuen Key neu.
- **CORS-Fehler im Browser:** `FRONTEND_ORIGIN` in `backend/fly.toml` prüfen.
- **API blockiert (CSP):** `connect-src` in `frontend/public/_headers` prüfen.
- **Automatischen Deploy stoppen:** `gh variable set DEPLOY_ENABLED --body false`.

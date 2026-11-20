# Deployment

Alles läuft auf **Cloudflare**, im Gratis-Plan (Workers Free). Es gibt harte Limits statt einer
Rechnung: Ist ein Kontingent aufgebraucht, antwortet der Dienst mit einem Fehler, und die Seite
zeigt die gespeicherten Daten.

| Teil | Wo | Adresse |
|---|---|---|
| Frontend | Cloudflare Pages, Projekt `silvan-os` | https://silvanbrors.ch (Ersatz: `silvan-os.pages.dev`) |
| Backend (live) | Pages Functions im selben Projekt (`frontend/functions/api/*`) | https://silvanbrors.ch/api/… |
| Datenbank | Cloudflare D1 `silvan-os` (SQLite) | nur für die Functions |
| IPA-Assistent | Pages Function + Workers AI + Vectorize `ipa-notes` | https://silvanbrors.ch/api/ipa/ask |

Das **Spring-Boot-Backend** (`backend/`) bleibt im Repo, wird bei jedem PR getestet und läuft lokal
mit `docker compose up`. Live beantworten die Pages Functions dieselben Endpunkte mit demselben
Verhalten (`frontend/server/liveData.ts`, Tests in `liveData.test.ts`), siehe `docs/api.md`.

Nach jedem Merge auf `main` baut `.github/workflows/frontend.yml` die Seite und deployt Seite und
Functions zusammen, wenn die Repo-Variable `DEPLOY_ENABLED` auf `true` steht.

## Kosten (Workers Free, Stand 2026)

- **Pages:** gratis, Functions zählen als Workers-Anfragen (100'000 pro Tag).
- **D1:** 5 GB Speicher, 5 Mio. gelesene und 100'000 geschriebene Zeilen pro Tag.
- **Workers AI und Vectorize:** tägliches Gratis-Kontingent, rund 450 IPA-Antworten pro Tag.
- **Domain:** jährliche Gebühr bei Hostpoint.

## Einmalig einrichten (erledigt)

### 1. Domain

1. `silvanbrors.ch` bei einem Registrar für `.ch` registrieren. Cloudflare selbst
   verkauft keine `.ch`-Domains.
2. In Cloudflare (Free-Plan) *Add a domain* → `silvanbrors.ch`.
3. Beim Registrar die Nameserver auf die zwei Nameserver setzen, die Cloudflare anzeigt.
   Es kann bis zu 24 h dauern, bis Cloudflare die Domain als *Active* zeigt.
4. **Stand (20.11.2026):** erledigt. Registrar ist Hostpoint, die Nameserver sind
   `nero.ns.cloudflare.com` und `rose.ns.cloudflare.com`. Vorher musste DNSSEC bei Hostpoint aus.
   `www.silvanbrors.ch` leitet per Redirect-Regel (301) auf `silvanbrors.ch` um. Die Mail-Einträge
   von Hostpoint (MX, SPF, DMARC, autoconfig) sind übernommen.
5. **DNSSEC** ist in Cloudflare eingeschaltet (*DNS* → *Settings*). Die .ch-Registry übernimmt den
   DS-Eintrag meist von selbst (CDS). Steht er nach ein paar Tagen noch nicht, den DS-Eintrag aus
   Cloudflare bei Hostpoint unter *DNSSEC* eintragen.

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

### 3. Datenbank (D1)

```bash
cd frontend
npx wrangler d1 create silvan-os                           # ID steht in wrangler.toml
npx wrangler d1 migrations apply silvan-os --remote        # Tabellen aus migrations/
```

Neue Tabelle oder Spalte = neue Datei `migrations/000N_….sql`, dann denselben Befehl ausführen.

### 4. API-Keys für Clipper und Agents

Die Schreib-Endpunkte brauchen `X-Api-Key`. Die Keys sind Secrets im Pages-Projekt:

```bash
cd frontend
npx wrangler pages secret put CLIPPER_API_KEY --project-name silvan-os   # Wert einfügen
npx wrangler pages secret put AGENTS_API_KEY --project-name silvan-os
```

Derselbe Key steht als `PORTFOLIO_API_KEY` in der `.env` des Clippers bzw. von `rtr-marketing`,
dazu `PORTFOLIO_API_URL=https://silvanbrors.ch`. Neuer Key: Secret neu setzen, `.env` anpassen,
dann einmal neu deployen (Secrets gelten ab dem nächsten Deploy).

### 5. IPA-Chat: RAG über die Notizen auf Cloudflare, ipa-assistant bleibt lokal

`ipa-assistant` darf nicht öffentlich sein. Auf der Live-Seite bleibt `IPA_ASSISTANT_URL`
deshalb **leer**. Fragen beantwortet dort eine Pages Function (`frontend/functions/api/ipa/ask.ts`,
Logik in `frontend/server/ipaAgent.ts`):

1. Frage mit `bge-m3` einbetten (Workers AI),
2. die passendsten Abschnitte aus Silvans Lernnotizen im **Vectorize-Index `ipa-notes`** suchen,
3. Llama 3.3 70B antwortet nur daraus, in eigenen Worten, mit Quellen (Datei › Abschnitt).
   Findet die Suche nichts Passendes, sagt der Chat das, ohne das Sprachmodell aufzurufen.

**Die Notizen werden nicht veröffentlicht.** Sie liegen nur im Index auf Cloudflare, nie im Repo
oder auf der Website. Der Assistent gibt sie nicht wörtlich heraus.

- **Notizen einlesen oder aktualisieren** (Quelle: `ipa-assistant/lernunterlagen/`):
  ```bash
  cd frontend
  npx wrangler login    # falls nötig
  T=$(npx wrangler auth token)
  CLOUDFLARE_ACCOUNT_ID=<account id> CLOUDFLARE_API_TOKEN="$T"     node --experimental-strip-types scripts/ingest-notes.ts
  ```
  Abschnitte, die es nicht mehr gibt, bleiben im Index. Bei grösseren Umbauten den Index neu
  anlegen: `npx wrangler vectorize delete ipa-notes` und
  `npx wrangler vectorize create ipa-notes --dimensions=1024 --metric=cosine`, dann einlesen.
- **Bindings:** `AI` und `NOTES` stehen in `frontend/wrangler.toml`. Der Workflow baut mit
  `VITE_IPA_AGENT=true` und `VITE_IPA_URL=/`.
- **Kosten:** Workers AI und Vectorize haben Gratis-Kontingente (rund 450 Antworten pro Tag).
  Ist das Kontingent aufgebraucht, meldet der Chat «Kontingent für heute aufgebraucht». Auf dem
  Workers-Free-Plan entstehen keine Kosten.
- **Missbrauch:** Eine Rate-Limiting-Regel der Zone (*Security* → *WAF* → *Rate limiting rules*)
  begrenzt `/api/ipa/ask` auf 3 Fragen pro 10 s und IP.
- **Abschalten:** Im Workflow `VITE_IPA_AGENT` entfernen. Dann zeigt der Chat wieder nur Beispiele.

Wie man den Chat lokal gegen `ipa-assistant` laufen lässt, steht in `docs/api.md`.

### 6. GitHub

Im Repo unter *Settings* → *Secrets and variables* → *Actions*, oder mit `gh`:

```bash
gh secret set CLOUDFLARE_API_TOKEN     # Pages Edit, Workers AI Read, D1 Edit
gh secret set CLOUDFLARE_ACCOUNT_ID
gh variable set DEPLOY_ENABLED --body true
```

## Prüfen

```bash
curl -i https://silvanbrors.ch/api/status            # JSON, Werte null bis Daten kommen
curl -i https://silvanbrors.ch/api/agents/report     # 404 bis zum ersten Bericht
curl -I https://silvanbrors.ch                       # Header aus frontend/public/_headers
```

Im Browser zeigt das WLAN-Popover am Desktop «Backend online · Antwortzeit … ms».

## Wenn etwas schiefgeht

- **Zurücksetzen:** *Workers & Pages* → `silvan-os` → *Deployments* → beim letzten guten Deploy
  *Rollback*. Seite und Functions gehen zusammen zurück.
- **Logs:** `npx wrangler pages deployment tail --project-name silvan-os`.
- **Daten ansehen:** `npx wrangler d1 execute silvan-os --remote --command "select * from clip_event order by created_at desc limit 5"`.
- **401 beim Clipper oder den Agents:** Key in der `.env` und das Secret vergleichen.
- **Deploy schlägt mit Berechtigung fehl:** Der GitHub-Token braucht *Pages Edit*,
  *Workers AI Read* und *D1 Edit*.
- **API blockiert (CSP):** `connect-src` in `frontend/public/_headers` prüfen.
- **Automatischen Deploy stoppen:** `gh variable set DEPLOY_ENABLED --body false`.

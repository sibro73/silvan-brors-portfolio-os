# Silvan OS

Mein Portfolio als Desktop im Browser: Projekte öffnen sich als Apps in verschiebbaren
Fenstern, im Terminal kann man Befehle eingeben, und die Live-Zahlen kommen aus einem
eigenen Spring-Boot-Backend.

**Live:** [Link folgt]

## Stack
- Frontend: React, TypeScript, Vite
- Backend: Spring Boot 4, Java 21, Postgres
- Betrieb: Docker, GitHub Actions, [Hosting]

## Lokal starten
```bash
cp .env.example .env       # POSTGRES_PASSWORD setzen
docker compose up --build  # backend (localhost:8080) + postgres (localhost:5433)
cd frontend && npm install && npm run dev
```

Ports belegt? In `.env` `BACKEND_PORT` bzw. `POSTGRES_PORT` ändern und im Frontend
`VITE_API_URL` in `frontend/.env.local` anpassen (Vorlage: `frontend/.env.example`).
Ohne Backend zeigt die Seite die gespeicherten Daten aus `frontend/src/data/`.

## Deployment
Frontend auf Cloudflare Pages (silvanbrors.ch), Backend auf Fly.io (api.silvanbrors.ch).
Nach jedem Merge auf `main` wird automatisch deployt. Einrichtung und Rollback:
[`docs/deploy.md`](docs/deploy.md).

## Projekte, die man im Desktop findet
- **Rigged to Riches**: Koop-Heist-Spiel (Unity), bald auf Steam
- **Clipper**: Echtzeit-Bot, der Highlights aus Livestreams schneidet
- **IPA-Lernassistent**: RAG über meine IPA-Lernnotizen
- **Marketing-Agents**: Multi-Agent-System für den Spiel-Release (in Arbeit)

Plan und Stand: [`docs/plan.md`](docs/plan.md)

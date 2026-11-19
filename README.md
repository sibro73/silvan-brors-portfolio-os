# Silvan OS

Mein Portfolio als Desktop im Browser: Projekte öffnen sich als Apps in verschiebbaren
Fenstern, im Terminal kann man Befehle eingeben, und die Live-Zahlen kommen aus einem
eigenen Spring-Boot-Backend.

**Live:** [Link folgt]

## Stack
- Frontend: React, TypeScript, Vite
- Backend: Spring Boot 3, Java 21, Postgres
- Betrieb: Docker, GitHub Actions, [Hosting]

## Lokal starten
```bash
docker compose up          # backend + postgres
cd frontend && npm install && npm run dev
```

## Projekte, die man im Desktop findet
- **Rigged to Riches**: Koop-Heist-Spiel (Unity), bald auf Steam
- **Clipper**: Echtzeit-Bot, der Highlights aus Livestreams schneidet
- **IPA-Lernassistent**: RAG über meine IPA-Lernnotizen
- **Marketing-Agents**: Multi-Agent-System für den Spiel-Release (in Arbeit)

Plan und Stand: [`docs/plan.md`](docs/plan.md)

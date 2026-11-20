# Backend-API

Basis-URL: `https://silvanbrors.ch` (lokal `http://localhost:8080`). Alle Antworten sind JSON.

Live beantworten Cloudflare Pages Functions mit D1 diese Endpunkte (`frontend/server/liveData.ts`),
lokal das Spring-Boot-Backend. Verhalten und Format sind gleich, beide sind getestet.

| Methode | Pfad | Wer | Schutz |
|---|---|---|---|
| GET | `/api/status` | Frontend, Terminal | öffentlich |
| GET | `/api/agents/report` | Frontend | öffentlich |
| POST | `/api/ipa/ask` | Frontend (IPA-Chat, nur lokal) | Rate-Limit pro IP |
| POST | `/api/clipper/events` | Clipper | `X-Api-Key: $CLIPPER_API_KEY` |
| POST | `/api/agents/report` | Marketing-Agents | `X-Api-Key: $AGENTS_API_KEY` |

Bei den POST-Endpunkten mit Key gilt:
- Fehlt der Key auf dem Server, ist der Endpunkt geschlossen und antwortet mit `503`.
- Fehlt der Key in der Anfrage oder ist er falsch, kommt `401`.
- Ungültige Daten geben `400`.

Ein Browser kann diese Endpunkte nicht aufrufen. CORS erlaubt nur GET, und POST einzig für `/api/ipa/**`.

Das Backend schläft, wenn niemand es braucht. Die erste Anfrage nach einer Pause kann
deshalb einige Sekunden dauern. Clients sollten mindestens 15 s warten und bei einem
Netzwerkfehler später nochmals senden. Das ist sicher, weil doppelte Meldungen nichts verändern.

## `POST /api/clipper/events`

Der Clipper meldet jeden geschnittenen Clip.

```json
{ "clipId": "twitch-2026-11-20-0042", "createdAt": "2026-11-20T14:05:00Z" }
```

| Feld | Regel |
|---|---|
| `clipId` | Pflicht, höchstens 100 Zeichen, nur `A-Z a-z 0-9 . _ : -`. Die eigene ID des Clippers. |
| `createdAt` | Pflicht, ISO 8601 mit Zeitzone. Höchstens 5 Minuten in der Zukunft. |

Antworten:
- `201`: neuer Clip.
- `200`: diesen `clipId` gab es schon. Er wird nicht doppelt gezählt.
- `400`: ungültige Daten.

```bash
curl -X POST https://silvanbrors.ch/api/clipper/events \
  -H "X-Api-Key: $CLIPPER_API_KEY" -H "Content-Type: application/json" \
  -d '{"clipId":"test-1","createdAt":"2026-11-20T14:05:00Z"}'
```

«Clips heute» im Status zählt die Clips seit Mitternacht in Zürich. Solange der Clipper
noch nie etwas gemeldet hat, ist der Wert `null`, und die Seite zeigt den Platzhalter.

## `POST /api/agents/report`

Der Analyse-Agent schickt den Wochenbericht in genau der Form von
`frontend/src/data/agents-report.json`. Der neuste Bericht wird angezeigt.

| Feld | Regel |
|---|---|
| `meta`, `title` | Pflicht, höchstens 200 Zeichen |
| `week` | Pflicht, höchstens 50 Zeichen, z. B. `KW 47` |
| `intro`, `recommendation` | Pflicht, höchstens 2000 Zeichen |
| `channels` | 1–10 Einträge: `name` und `views` (Text, höchstens 50 Zeichen), `barWidth` 0–100, `highlight` optional |
| `note` | optional, höchstens 500 Zeichen |

Antwort `201`. Mit `GET /api/agents/report` kommt der neuste Bericht zurück. Gibt es noch
keinen, antwortet der Endpunkt mit `404`, und die Seite zeigt den gespeicherten Bericht aus `data/`.

## `POST /api/ipa/ask`

Der Chat im Fenster «IPA-Assistent». Das Portfolio-Backend beantwortet die Frage nicht selbst.
Es leitet sie an das separate Projekt `ipa-assistant` weiter (`GET {IPA_ASSISTANT_URL}/chat?frage=…`)
und schützt es davor.

**Nur lokal:** `ipa-assistant` ist nicht öffentlich. In Produktion ist `IPA_ASSISTANT_URL` leer.
Auf der Live-Seite beantwortet stattdessen eine Pages Function unter
`https://silvanbrors.ch/api/ipa/ask` die Fragen im selben Format, als RAG über die Notizen in
Cloudflare Vectorize (`frontend/server/ipaAgent.ts`, siehe `docs/deploy.md` → 6).
Das Backend selbst antwortet in Produktion mit `503`. Lokal ausprobieren:

1. `ipa-assistant` starten: `.\mvnw spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"`
   (Port 8080 gehört dem Portfolio-Backend).
2. Portfolio-Backend mit `IPA_ASSISTANT_URL=http://localhost:8081` starten, in `docker compose`
   mit `http://host.docker.internal:8081` (in `.env`).
3. In `frontend/.env.local` `VITE_IPA_LIVE=true` setzen und `npm run dev` starten.

```json
{ "frage": "Was heisst IPERKA?" }
```

Antwort `200`, unverändert von `ipa-assistant`. Die Quellen stammen aus den verwendeten
Abschnitten, nicht vom LLM.

```json
{
  "antwort": "Informieren, Planen, Entscheiden, …",
  "quellen": [{ "datei": "1.1 – IPERKA & Projektmethodik.md", "abschnitt": "IPERKA", "score": 0.82 }]
}
```

| Status | Wann | `fehler` |
|---|---|---|
| `400` | Frage kürzer als 3 oder länger als 300 Zeichen | «Die Frage muss 3 bis 300 Zeichen lang sein.» |
| `429` | mehr als 5 Fragen pro Minute oder 30 pro Tag von derselben IP, oder 200 pro Tag insgesamt. Header `Retry-After` in Sekunden. | «Zu viele Fragen. Bitte versuch es später nochmals.» |
| `503` | `IPA_ASSISTANT_URL` leer | «Der Assistent ist gerade offline.» |
| `503` | `ipa-assistant` nicht erreichbar oder Fehler | «Der Assistent ist gerade nicht erreichbar.» |
| `504` | keine Antwort innert 30 s | «Der Assistent hat zu lange gebraucht. Versuch es nochmals.» |

Ist der Assistent offline, verbraucht die Frage kein Kontingent. Gespeichert wird nur der
Zeitpunkt jeder beantworteten Frage, für `ipaFragen`. Der Text der Frage wird nicht gespeichert.

## `GET /api/status`

```json
{ "wishlists": null, "clipsHeute": 3, "ipaFragen": null, "letzterBericht": "2026-11-16" }
```

`null` heisst «noch keine Daten». Ist die Datenbank nicht erreichbar, kommt trotzdem `200`,
mit lauter `null`. Die Werte sind bis zu 30 s alt (Cache).

| Wert | Quelle |
|---|---|
| `clipsHeute` | Clipper |
| `letzterBericht` | Datum des neusten Wochenberichts (Zürich) |
| `wishlists` | noch nicht angebunden, siehe `docs/steam.md` |
| `ipaFragen` | Anzahl beantworteter Fragen im IPA-Chat (insgesamt) |

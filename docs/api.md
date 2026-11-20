# Backend-API

Basis-URL: `https://api.silvanbrors.ch` (lokal `http://localhost:8080`). Alle Antworten sind JSON.

| Methode | Pfad | Wer | Schutz |
|---|---|---|---|
| GET | `/api/status` | Frontend, Terminal | öffentlich |
| GET | `/api/agents/report` | Frontend | öffentlich |
| POST | `/api/clipper/events` | Clipper | `X-Api-Key: $CLIPPER_API_KEY` |
| POST | `/api/agents/report` | Marketing-Agents | `X-Api-Key: $AGENTS_API_KEY` |

Bei den POST-Endpunkten gilt:
- Fehlt der Key auf dem Server, ist der Endpunkt geschlossen und antwortet mit `503`.
- Fehlt der Key in der Anfrage oder ist er falsch, kommt `401`.
- Ungültige Daten geben `400`.

Ein Browser kann diese Endpunkte nicht aufrufen, weil CORS nur GET erlaubt.

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
curl -X POST https://api.silvanbrors.ch/api/clipper/events \
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
| `ipaFragen` | Phase 5 |

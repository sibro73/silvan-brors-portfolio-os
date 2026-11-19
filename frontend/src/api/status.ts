import { type Status, status as fallbackStatus } from '../data';

/**
 * Basis-URL des Backends. In Produktion über `VITE_API_URL` gesetzt.
 * Fehlt sie, gibt es (ausser im Dev-Modus) gar keinen Request: die Seite zeigt die Daten aus `data/`.
 */
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

export const STATUS_TIMEOUT_MS = 3000;

export interface StatusResult {
  status: Status;
  /** `live`: Antwort vom Backend. `fallback`: gespeicherte Daten aus `data/`. */
  source: 'live' | 'fallback';
  /** Antwortzeit in ms, nur bei `live`. */
  latencyMs?: number;
}

/** So liefert das Backend den Status: `null` heisst «noch keine Daten». */
interface StatusDto {
  wishlists: number | null;
  clipsHeute: number | null;
  ipaFragen: number | null;
  letzterBericht: string | null;
}

const isCount = (v: unknown): v is number | null =>
  v === null || (typeof v === 'number' && Number.isFinite(v));

function isStatusDto(v: unknown): v is StatusDto {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    isCount(o.wishlists) &&
    isCount(o.clipsHeute) &&
    isCount(o.ipaFragen) &&
    (o.letzterBericht === null || typeof o.letzterBericht === 'string')
  );
}

/** Werte vom Backend, wo vorhanden. Sonst bleibt der Platzhalter aus `data/`. */
export function mergeStatus(fallback: Status, dto: StatusDto): Status {
  return {
    wishlists: dto.wishlists ?? fallback.wishlists,
    clipsHeute: dto.clipsHeute ?? fallback.clipsHeute,
    ipaFragen: dto.ipaFragen ?? fallback.ipaFragen,
    letzterBericht: dto.letzterBericht ?? fallback.letzterBericht,
  };
}

const offline = (): StatusResult => ({ status: fallbackStatus, source: 'fallback' });

/**
 * Holt `GET /api/status`. Wirft nie: bei fehlendem Backend, Fehler, Timeout oder
 * unerwarteter Antwort kommen die gespeicherten Daten zurück.
 */
export async function fetchStatus(
  baseUrl: string = API_URL,
  timeoutMs: number = STATUS_TIMEOUT_MS,
): Promise<StatusResult> {
  if (!baseUrl) return offline();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/status`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return offline();
    const body: unknown = await res.json();
    if (!isStatusDto(body)) return offline();
    return {
      status: mergeStatus(fallbackStatus, body),
      source: 'live',
      latencyMs: Math.round(performance.now() - started),
    };
  } catch {
    return offline();
  } finally {
    clearTimeout(timer);
  }
}

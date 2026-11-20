import { type Status, status as fallbackStatus } from '../data';
import { API_TIMEOUT_MS, API_URL, getJson } from './http';

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
  timeoutMs: number = API_TIMEOUT_MS,
): Promise<StatusResult> {
  const res = await getJson(baseUrl, '/api/status', timeoutMs);
  if (!res || !isStatusDto(res.body)) return offline();
  return {
    status: mergeStatus(fallbackStatus, res.body),
    source: 'live',
    latencyMs: res.latencyMs,
  };
}

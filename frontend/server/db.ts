/**
 * Gemeinsames für die Pages Functions mit D1 (Live-Daten). Nur der Teil des D1-Bindings,
 * den wir brauchen, damit Tests eine echte SQLite-Datenbank unterschieben können.
 */

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ meta: { changes: number } }>;
}

export interface D1Like {
  prepare(sql: string): D1Statement;
}

export const ZONE = 'Europe/Zurich';

export function json(
  status: number,
  body?: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json; charset=utf-8' }),
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

/** Datum in Zürich als «JJJJ-MM-TT». */
export function zurichDate(ms: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
}

/** Abstand Zürich zu UTC in ms zum Zeitpunkt `ms` (Winter +1 h, Sommer +2 h). */
function zurichOffsetMs(ms: number): number {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone: ZONE, timeZoneName: 'shortOffset' })
      .formatToParts(new Date(ms))
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(name);
  if (!m) return 0;
  const sign = m[1].startsWith('-') ? -1 : 1;
  return sign * (Math.abs(Number(m[1])) * 60 + Number(m[2] ?? 0)) * 60_000;
}

/** Mitternacht in Zürich (heute) und der nächsten Mitternacht, als UTC-ms. */
export function zurichDayRange(nowMs: number): { from: number; to: number } {
  const [y, mo, d] = zurichDate(nowMs).split('-').map(Number);
  const midnight = (day: number) => {
    const guess = Date.UTC(y, mo - 1, day);
    // In der Schweiz wechselt die Sommerzeit nie um Mitternacht: der Abstand am Mittag reicht.
    return guess - zurichOffsetMs(guess + 12 * 3_600_000);
  };
  return { from: midnight(d), to: midnight(d + 1) };
}

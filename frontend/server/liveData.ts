/**
 * Live-Daten auf Cloudflare (Pages Functions + D1), gleiches Verhalten wie das Spring-Backend:
 *
 * - `GET  /api/status`          Live-Zahlen. `null` = noch keine Daten (Frontend zeigt Platzhalter).
 * - `POST /api/clipper/events`  Clipper meldet einen Clip (X-Api-Key). 201 neu, 200 schon bekannt.
 * - `GET  /api/agents/report`   neuster Wochenbericht, 404 wenn es noch keinen gibt.
 * - `POST /api/agents/report`   Agents liefern den Bericht ab (X-Api-Key). 201.
 */
import { checkApiKey } from './apiKey';
import { type D1Like, json, zurichDate, zurichDayRange } from './db';

export interface LiveEnv {
  DB?: D1Like;
  CLIPPER_API_KEY?: string;
  AGENTS_API_KEY?: string;
}

/** Toleranz für Uhren, die etwas vorgehen. */
export const MAX_CLOCK_SKEW_MS = 5 * 60_000;
const CLIP_ID = /^[A-Za-z0-9._:-]{1,100}$/;
/** ISO 8601 mit Zeitzone, z. B. 2026-11-20T14:05:00Z oder …+01:00 */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/;

const noDb = () => json(503, { fehler: 'Datenbank ist nicht eingerichtet.' });

// ---------------------------------------------------------------- Status

export interface StatusDto {
  wishlists: number | null;
  clipsHeute: number | null;
  ipaFragen: number | null;
  letzterBericht: string | null;
}

export const STATUS_UNAVAILABLE: StatusDto = {
  wishlists: null,
  clipsHeute: null,
  ipaFragen: null,
  letzterBericht: null,
};

export async function readStatus(db: D1Like, nowMs: number): Promise<StatusDto> {
  const anyClip = await db.prepare('select 1 as x from clip_event limit 1').first();
  let clipsHeute: number | null = null;
  if (anyClip) {
    const { from, to } = zurichDayRange(nowMs);
    const row = await db
      .prepare('select count(*) as n from clip_event where created_at >= ? and created_at < ?')
      .bind(from, to)
      .first<{ n: number }>();
    clipsHeute = row?.n ?? 0;
  }
  const ipa = await db.prepare('select count(*) as n from ipa_question').first<{ n: number }>();
  const last = await db
    .prepare(
      'select received_at as at from agents_report order by received_at desc, id desc limit 1',
    )
    .first<{ at: number }>();
  return {
    wishlists: null, // Steam ist noch nicht angebunden
    clipsHeute,
    ipaFragen: ipa && ipa.n > 0 ? ipa.n : null,
    letzterBericht: last ? zurichDate(last.at) : null,
  };
}

export async function handleStatus(env: LiveEnv, nowMs: number = Date.now()): Promise<Response> {
  // Kurz zwischenspeichern: die Zahlen ändern sich selten
  const cache = { 'Cache-Control': 'public, max-age=30' };
  if (!env.DB) return json(200, STATUS_UNAVAILABLE, cache);
  try {
    return json(200, await readStatus(env.DB, nowMs), cache);
  } catch {
    // Die Seite muss auch ohne Datenbank funktionieren: «keine Daten»
    return json(200, STATUS_UNAVAILABLE, cache);
  }
}

// ---------------------------------------------------------------- Clipper

export async function handleClipEvent(
  request: Request,
  env: LiveEnv,
  nowMs: number = Date.now(),
): Promise<Response> {
  const denied = await checkApiKey(request, env.CLIPPER_API_KEY);
  if (denied) return denied;
  if (!env.DB) return noDb();

  const body: unknown = await request.json().catch(() => null);
  const o = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const { clipId, createdAt } = o;
  if (typeof clipId !== 'string' || !CLIP_ID.test(clipId)) {
    return json(400, { fehler: 'clipId: 1–100 Zeichen aus A–Z, a–z, 0–9, . _ : -' });
  }
  const created =
    typeof createdAt === 'string' && ISO_INSTANT.test(createdAt) ? Date.parse(createdAt) : NaN;
  if (Number.isNaN(created)) {
    return json(400, { fehler: 'createdAt: Zeitpunkt nach ISO 8601 mit Zeitzone' });
  }
  if (created > nowMs + MAX_CLOCK_SKEW_MS) {
    return json(400, { fehler: 'createdAt liegt in der Zukunft.' });
  }
  const res = await env.DB.prepare(
    'insert into clip_event (clip_id, created_at, received_at) values (?, ?, ?) on conflict (clip_id) do nothing',
  )
    .bind(clipId, created, nowMs)
    .run();
  return json(res.meta.changes > 0 ? 201 : 200);
}

// ---------------------------------------------------------------- Agents

export interface Channel {
  name: string;
  barWidth: number;
  highlight?: boolean;
  views: string;
}

export interface AgentsReport {
  meta: string;
  week: string;
  title: string;
  intro: string;
  channels: Channel[];
  recommendation: string;
  note?: string;
}

const text = (v: unknown, max: number) =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max;

/** Prüft den Bericht wie das Spring-Backend und gibt nur die bekannten Felder zurück. */
export function parseReport(v: unknown): AgentsReport | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (
    !text(o.meta, 200) ||
    !text(o.week, 50) ||
    !text(o.title, 200) ||
    !text(o.intro, 2000) ||
    !text(o.recommendation, 2000)
  ) {
    return null;
  }
  if (
    o.note !== undefined &&
    o.note !== null &&
    (typeof o.note !== 'string' || o.note.length > 500)
  ) {
    return null;
  }
  if (!Array.isArray(o.channels) || o.channels.length < 1 || o.channels.length > 10) return null;
  const channels: Channel[] = [];
  for (const c of o.channels as unknown[]) {
    if (typeof c !== 'object' || c === null) return null;
    const ch = c as Record<string, unknown>;
    if (!text(ch.name, 50) || !text(ch.views, 50)) return null;
    if (
      typeof ch.barWidth !== 'number' ||
      !Number.isInteger(ch.barWidth) ||
      ch.barWidth < 0 ||
      ch.barWidth > 100
    ) {
      return null;
    }
    if (ch.highlight !== undefined && ch.highlight !== null && typeof ch.highlight !== 'boolean')
      return null;
    channels.push({
      name: ch.name as string,
      barWidth: ch.barWidth,
      ...(typeof ch.highlight === 'boolean' ? { highlight: ch.highlight } : {}),
      views: ch.views as string,
    });
  }
  return {
    meta: o.meta as string,
    week: o.week as string,
    title: o.title as string,
    intro: o.intro as string,
    channels,
    recommendation: o.recommendation as string,
    ...(typeof o.note === 'string' ? { note: o.note } : {}),
  };
}

export async function handleGetReport(env: LiveEnv): Promise<Response> {
  if (!env.DB) return json(404);
  try {
    const row = await env.DB.prepare(
      'select report from agents_report order by received_at desc, id desc limit 1',
    ).first<{ report: string }>();
    return row
      ? json(200, JSON.parse(row.report), { 'Cache-Control': 'public, max-age=60' })
      : json(404);
  } catch {
    return json(404);
  }
}

export async function handlePostReport(
  request: Request,
  env: LiveEnv,
  nowMs: number = Date.now(),
): Promise<Response> {
  const denied = await checkApiKey(request, env.AGENTS_API_KEY);
  if (denied) return denied;
  if (!env.DB) return noDb();
  const report = parseReport(await request.json().catch(() => null));
  if (!report) return json(400, { fehler: 'Bericht ungültig, Format siehe docs/api.md.' });
  await env.DB.prepare('insert into agents_report (report, received_at) values (?, ?)')
    .bind(JSON.stringify(report), nowMs)
    .run();
  return json(201);
}

// ---------------------------------------------------------------- IPA

/** Zählt beantwortete IPA-Fragen (nur den Zeitpunkt). Fehler sind egal, die Antwort zählt. */
export async function recordIpaQuestion(db: D1Like | undefined, nowMs: number = Date.now()) {
  if (!db) return;
  try {
    await db.prepare('insert into ipa_question (answered_at) values (?)').bind(nowMs).run();
  } catch {
    // Zähler ist Nebensache
  }
}

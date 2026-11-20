// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { zurichDate, zurichDayRange } from './db';
import {
  handleClipEvent,
  handleGetReport,
  handlePostReport,
  handleStatus,
  type LiveEnv,
  MAX_CLOCK_SKEW_MS,
  parseReport,
  recordIpaQuestion,
  STATUS_UNAVAILABLE,
} from './liveData';
import { createTestDb } from './testDb';

const KEY = 'geheim-fuer-tests';
// 20.11.2026, 14:00 in Zürich (Winterzeit, UTC+1)
const NOW = Date.parse('2026-11-20T13:00:00Z');

const env = (overrides: Partial<LiveEnv> = {}): LiveEnv => ({
  DB: createTestDb(),
  CLIPPER_API_KEY: KEY,
  AGENTS_API_KEY: KEY,
  ...overrides,
});

const post = (path: string, body: unknown, key: string | null = KEY) =>
  new Request(`https://silvanbrors.ch${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(key === null ? {} : { 'X-Api-Key': key }) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const clip = (clipId: string, createdAt: string, key?: string | null) =>
  post('/api/clipper/events', { clipId, createdAt }, key);

const REPORT = {
  meta: 'Analyse-Agent · automatisch erstellt',
  week: 'KW 47',
  title: 'Wochenbericht Marketing',
  intro: 'TikTok lief am besten.',
  channels: [
    { name: 'TikTok', barWidth: 100, highlight: true, views: "12'400" },
    { name: 'X', barWidth: 20, views: '2’100' },
  ],
  recommendation: 'Mehr Frage-Hooks.',
};

describe('Zurich time', () => {
  it('uses the Zurich date and day, also around midnight and in summer', () => {
    expect(zurichDate(Date.parse('2026-11-30T23:30:00Z'))).toBe('2026-12-01');
    expect(zurichDayRange(NOW)).toEqual({
      from: Date.parse('2026-11-19T23:00:00Z'),
      to: Date.parse('2026-11-20T23:00:00Z'),
    });
    expect(zurichDayRange(Date.parse('2026-07-01T10:00:00Z'))).toEqual({
      from: Date.parse('2026-06-30T22:00:00Z'),
      to: Date.parse('2026-07-01T22:00:00Z'),
    });
  });
});

describe('GET /api/status', () => {
  it('has no data yet: everything null, cached 30 s', async () => {
    const res = await handleStatus(env(), NOW);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=30');
    expect(await res.json()).toEqual(STATUS_UNAVAILABLE);
  });

  it('counts clips of today in Zurich, IPA questions and the last report date', async () => {
    const e = env();
    for (const [id, at] of [
      ['a', '2026-11-19T22:59:00Z'], // 19.11. 23:59 in Zürich: gestern
      ['b', '2026-11-19T23:00:00Z'], // 20.11. 00:00 in Zürich: heute
      ['c', '2026-11-20T12:00:00Z'],
    ]) {
      await handleClipEvent(clip(id, at), e, NOW);
    }
    await recordIpaQuestion(e.DB, NOW);
    await recordIpaQuestion(e.DB, NOW);
    await handlePostReport(
      post('/api/agents/report', REPORT),
      e,
      Date.parse('2026-11-16T23:30:00Z'),
    );

    expect(await (await handleStatus(e, NOW)).json()).toEqual({
      wishlists: null,
      clipsHeute: 2,
      ipaFragen: 2,
      letzterBericht: '2026-11-17', // 00:30 in Zürich
    });
  });

  it('shows 0 clips today once the Clipper has ever reported', async () => {
    const e = env();
    await handleClipEvent(clip('alt', '2026-11-01T10:00:00Z'), e, NOW);
    expect(((await (await handleStatus(e, NOW)).json()) as { clipsHeute: number }).clipsHeute).toBe(
      0,
    );
  });

  it('without a database: all null instead of an error', async () => {
    expect(await (await handleStatus({}, NOW)).json()).toEqual(STATUS_UNAVAILABLE);
    const broken = env({
      DB: {
        prepare: () => {
          throw new Error('down');
        },
      },
    });
    expect(await (await handleStatus(broken, NOW)).json()).toEqual(STATUS_UNAVAILABLE);
  });
});

describe('POST /api/clipper/events', () => {
  it('201 for a new clip, 200 when it is sent again', async () => {
    const e = env();
    expect(
      (await handleClipEvent(clip('2026-11-20:lacy:1', '2026-11-20T12:00:00Z'), e, NOW)).status,
    ).toBe(201);
    expect(
      (await handleClipEvent(clip('2026-11-20:lacy:1', '2026-11-20T12:00:00Z'), e, NOW)).status,
    ).toBe(200);
  });

  it('needs the right API key', async () => {
    expect(
      (await handleClipEvent(clip('x', '2026-11-20T12:00:00Z', null), env(), NOW)).status,
    ).toBe(401);
    expect(
      (await handleClipEvent(clip('x', '2026-11-20T12:00:00Z', 'falsch'), env(), NOW)).status,
    ).toBe(401);
    const noKey = env({ CLIPPER_API_KEY: undefined });
    expect((await handleClipEvent(clip('x', '2026-11-20T12:00:00Z'), noKey, NOW)).status).toBe(503);
  });

  it.each([
    ['empty id', '', '2026-11-20T12:00:00Z'],
    ['bad characters', 'clip 1', '2026-11-20T12:00:00Z'],
    ['too long', 'x'.repeat(101), '2026-11-20T12:00:00Z'],
    ['no time zone', 'x', '2026-11-20T12:00:00'],
    ['not a date', 'x', 'gestern'],
  ])('rejects %s', async (_, id, at) => {
    expect((await handleClipEvent(clip(id, at), env(), NOW)).status).toBe(400);
  });

  it('accepts a little clock skew, but nothing from the future', async () => {
    const soon = new Date(NOW + MAX_CLOCK_SKEW_MS - 1000).toISOString();
    const later = new Date(NOW + MAX_CLOCK_SKEW_MS + 1000).toISOString();
    expect((await handleClipEvent(clip('soon', soon), env(), NOW)).status).toBe(201);
    expect((await handleClipEvent(clip('later', later), env(), NOW)).status).toBe(400);
  });
});

describe('/api/agents/report', () => {
  it('404 until a report exists, then the newest one', async () => {
    const e = env();
    expect((await handleGetReport(e)).status).toBe(404);
    expect((await handlePostReport(post('/api/agents/report', REPORT), e, NOW)).status).toBe(201);
    const newer = { ...REPORT, week: 'KW 48', note: 'Neu' };
    await handlePostReport(post('/api/agents/report', newer), e, NOW + 1000);
    const res = await handleGetReport(e);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(newer);
  });

  it('POST needs the API key and a valid report', async () => {
    expect(
      (await handlePostReport(post('/api/agents/report', REPORT, null), env(), NOW)).status,
    ).toBe(401);
    expect(
      (await handlePostReport(post('/api/agents/report', { ...REPORT, channels: [] }), env(), NOW))
        .status,
    ).toBe(400);
    expect((await handlePostReport(post('/api/agents/report', 'kaputt'), env(), NOW)).status).toBe(
      400,
    );
  });

  it('validates like the Spring backend and drops unknown fields', () => {
    expect(parseReport({ ...REPORT, extra: 'weg' })).toEqual(REPORT);
    expect(parseReport({ ...REPORT, week: 'x'.repeat(51) })).toBeNull();
    expect(parseReport({ ...REPORT, note: 'x'.repeat(501) })).toBeNull();
    expect(
      parseReport({ ...REPORT, channels: [{ name: 'X', barWidth: 101, views: '1' }] }),
    ).toBeNull();
    expect(
      parseReport({ ...REPORT, channels: [{ name: 'X', barWidth: 1.5, views: '1' }] }),
    ).toBeNull();
    expect(parseReport({ ...REPORT, channels: Array(11).fill(REPORT.channels[1]) })).toBeNull();
    expect(parseReport({ ...REPORT, intro: '  ' })).toBeNull();
  });
});

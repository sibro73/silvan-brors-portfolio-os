import { afterEach, describe, expect, it, vi } from 'vitest';

import { agentsReport as fallback } from '../data';
import { fetchAgentsReport, isAgentsReport } from './agentsReport';

const BASE = 'https://api.example.test';

const live = {
  meta: 'Analyse-Agent · automatisch erstellt',
  week: 'KW 47',
  title: 'Wochenbericht Marketing',
  intro: 'Was diese Woche funktioniert hat.',
  channels: [
    { name: 'TikTok', barWidth: 80, highlight: true, views: '1.2k' },
    { name: 'Reddit', barWidth: 30, views: '400' },
  ],
  recommendation: 'Mehr Clips auf TikTok.',
};

function respond(body: unknown, status = 200) {
  const fn = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isAgentsReport', () => {
  it('accepts the stored report and a live one without note', () => {
    expect(isAgentsReport(fallback)).toBe(true);
    expect(isAgentsReport(live)).toBe(true);
  });

  it('rejects broken shapes', () => {
    expect(isAgentsReport(null)).toBe(false);
    expect(isAgentsReport({ ...live, channels: [] })).toBe(false);
    expect(isAgentsReport({ ...live, title: 3 })).toBe(false);
    expect(isAgentsReport({ ...live, channels: [{ name: 'X', barWidth: 300, views: '1' }] })).toBe(
      false,
    );
  });
});

describe('fetchAgentsReport', () => {
  it('returns the live report', async () => {
    const fetch = respond(live);
    await expect(fetchAgentsReport(BASE)).resolves.toEqual(live);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/agents/report`, expect.anything());
  });

  it('falls back without backend, on 404 and on unexpected data', async () => {
    const fetch = respond(live);
    await expect(fetchAgentsReport('')).resolves.toBe(fallback);
    expect(fetch).not.toHaveBeenCalled();

    respond({}, 404);
    await expect(fetchAgentsReport(BASE)).resolves.toBe(fallback);

    respond({ hallo: 'welt' });
    await expect(fetchAgentsReport(BASE)).resolves.toBe(fallback);
  });

  it('falls back when the network fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('offline'))),
    );
    await expect(fetchAgentsReport(BASE)).resolves.toBe(fallback);
  });
});

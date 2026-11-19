import { afterEach, describe, expect, it, vi } from 'vitest';

import { status as fallback } from '../data';
import { fetchStatus, mergeStatus } from './status';

const BASE = 'https://api.example.test';

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}

const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('mergeStatus', () => {
  it('keeps placeholders where the backend has no value yet', () => {
    expect(
      mergeStatus(fallback, {
        wishlists: 12,
        clipsHeute: null,
        ipaFragen: 0,
        letzterBericht: null,
      }),
    ).toEqual({ wishlists: 12, clipsHeute: '[live]', ipaFragen: 0, letzterBericht: '[Datum]' });
  });
});

describe('fetchStatus', () => {
  it('returns live data with latency', async () => {
    const fetchMock = mockFetch(() =>
      json({ wishlists: 120, clipsHeute: 4, ipaFragen: 37, letzterBericht: '2026-11-16' }),
    );
    const r = await fetchStatus(`${BASE}/`);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/api/status`, expect.any(Object));
    expect(r.source).toBe('live');
    expect(r.status).toEqual({
      wishlists: 120,
      clipsHeute: 4,
      ipaFragen: 37,
      letzterBericht: '2026-11-16',
    });
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('is live but keeps placeholders while the backend reports nulls', async () => {
    mockFetch(() =>
      json({ wishlists: null, clipsHeute: null, ipaFragen: null, letzterBericht: null }),
    );
    const r = await fetchStatus(BASE);
    expect(r.source).toBe('live');
    expect(r.status).toEqual(fallback);
  });

  it('falls back without a request when no backend is configured', async () => {
    const fetchMock = mockFetch(() => json({}));
    const r = await fetchStatus('');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(r).toEqual({ status: fallback, source: 'fallback' });
  });

  it('falls back on http errors', async () => {
    mockFetch(() => json({ error: 'boom' }, 500));
    expect(await fetchStatus(BASE)).toEqual({ status: fallback, source: 'fallback' });
  });

  it('falls back on network errors', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await fetchStatus(BASE)).toEqual({ status: fallback, source: 'fallback' });
  });

  it('falls back on unexpected payloads', async () => {
    mockFetch(() =>
      json({ wishlists: 'viele', clipsHeute: 1, ipaFragen: 1, letzterBericht: null }),
    );
    expect((await fetchStatus(BASE)).source).toBe('fallback');
    mockFetch(() => json([1, 2, 3]));
    expect((await fetchStatus(BASE)).source).toBe('fallback');
  });

  it('aborts after the timeout and falls back', async () => {
    vi.useFakeTimers();
    mockFetch(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    const pending = fetchStatus(BASE, 3000);
    await vi.advanceTimersByTimeAsync(3000);
    expect(await pending).toEqual({ status: fallback, source: 'fallback' });
  });
});

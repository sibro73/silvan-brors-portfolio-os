import { afterEach, describe, expect, it, vi } from 'vitest';

import { askIpa, IPA_MESSAGES } from './ipa';

const BASE = 'https://api.example.test';

function respond(body: unknown, status = 200) {
  const fn = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
    Promise.resolve(
      new Response(typeof body === 'string' ? body : JSON.stringify(body), {
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
  vi.useRealTimers();
});

describe('askIpa', () => {
  it('posts the question and returns answer with sources', async () => {
    const fetch = respond({
      antwort: 'Ein Image ist die Vorlage.',
      quellen: [{ datei: '3.3 – Docker.md', abschnitt: 'Images', score: 0.8 }],
    });

    await expect(askIpa('Image oder Container?', BASE)).resolves.toEqual({
      ok: true,
      answer: 'Ein Image ist die Vorlage.',
      sources: [{ datei: '3.3 – Docker.md', abschnitt: 'Images' }],
    });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/api/ipa/ask`);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ frage: 'Image oder Container?' }));
  });

  it('is offline without backend, without a request', async () => {
    const fetch = respond({});
    await expect(askIpa('Frage', '')).resolves.toEqual({
      ok: false,
      message: IPA_MESSAGES.offline,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows the message from the backend', async () => {
    respond({ fehler: 'Zu viele Fragen. Bitte versuch es später nochmals.' }, 429);
    await expect(askIpa('Frage', BASE)).resolves.toEqual({
      ok: false,
      message: 'Zu viele Fragen. Bitte versuch es später nochmals.',
    });
  });

  it('falls back to a generic message on unexpected answers', async () => {
    respond('<html>Bad Gateway</html>', 502);
    await expect(askIpa('Frage', BASE)).resolves.toEqual({
      ok: false,
      message: IPA_MESSAGES.unreachable,
    });

    respond({ antwort: 3 });
    await expect(askIpa('Frage', BASE)).resolves.toEqual({
      ok: false,
      message: IPA_MESSAGES.unreachable,
    });
  });

  it('reports network errors and timeouts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('offline'))),
    );
    await expect(askIpa('Frage', BASE)).resolves.toEqual({
      ok: false,
      message: IPA_MESSAGES.unreachable,
    });

    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError')),
            );
          }),
      ),
    );
    const pending = askIpa('Frage', BASE, 1000);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).resolves.toEqual({ ok: false, message: IPA_MESSAGES.timeout });
  });
});

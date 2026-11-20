// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { type Ai, FEHLER, HINWEIS, handleAsk, MODEL, SYSTEM_PROMPT, toSwiss } from './ipaAgent';

const ask = (body: unknown) =>
  new Request('https://silvanbrors.ch/api/ipa/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const aiAnswering = (response: unknown): Ai => ({ run: vi.fn(() => Promise.resolve(response)) });
const aiFailing = (error: unknown): Ai => ({ run: vi.fn(() => Promise.reject(error)) });

describe('ipa agent (Pages Function)', () => {
  it('answers in the backend format, marked as general answer', async () => {
    const ai = aiAnswering({ response: '  Ein Unit-Test prüft eine einzelne Einheit.  ' });

    const res = await handleAsk(ask({ frage: '  Was ist ein Unit-Test?  ' }), ai);

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({
      antwort: 'Ein Unit-Test prüft eine einzelne Einheit.',
      quellen: [],
      hinweis: HINWEIS,
    });
    expect(ai.run).toHaveBeenCalledWith(MODEL, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Was ist ein Unit-Test?' },
      ],
      max_tokens: 400,
    });
  });

  it('writes Swiss German', async () => {
    expect(toSwiss('Grösse, Strasse, Maß, GROẞ')).toBe('Grösse, Strasse, Mass, GROSS');
    const res = await handleAsk(
      ask({ frage: 'Was ist Gießen?' }),
      aiAnswering({ response: 'Gießen' }),
    );
    expect(((await res.json()) as { antwort: string }).antwort).toBe('Giessen');
  });

  it.each([
    ['too short', { frage: ' ok ' }],
    ['too long', { frage: 'x'.repeat(301) }],
    ['no question', { question: 'Was ist Git?' }],
    ['not a string', { frage: 42 }],
    ['no JSON', 'frage=Was ist Git?'],
  ])('rejects invalid input: %s', async (_, body) => {
    const ai = aiAnswering({ response: 'nie' });
    const res = await handleAsk(ask(body), ai);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ fehler: FEHLER.invalid });
    expect(ai.run).not.toHaveBeenCalled();
  });

  it('without AI binding: 503', async () => {
    const res = await handleAsk(ask({ frage: 'Was ist Git?' }), undefined);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ fehler: FEHLER.unavailable });
  });

  it('daily quota used up: 429 with a clear message', async () => {
    const res = await handleAsk(
      ask({ frage: 'Was ist Git?' }),
      aiFailing(new Error('3036: Account limited: you have used up your daily free allocation')),
    );
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ fehler: FEHLER.quota });
  });

  it('other AI errors and empty answers: unavailable', async () => {
    const failed = await handleAsk(ask({ frage: 'Was ist Git?' }), aiFailing(new Error('boom')));
    expect(failed.status).toBe(503);

    const empty = await handleAsk(ask({ frage: 'Was ist Git?' }), aiAnswering({ response: ' ' }));
    expect(empty.status).toBe(502);
    expect(await empty.json()).toEqual({ fehler: FEHLER.unavailable });
  });

  it('gives up after the timeout', async () => {
    const slow: Ai = { run: () => new Promise(() => {}) };
    const res = await handleAsk(ask({ frage: 'Was ist Git?' }), slow, 10);
    expect(res.status).toBe(504);
    expect(await res.json()).toEqual({ fehler: FEHLER.timeout });
  });
});

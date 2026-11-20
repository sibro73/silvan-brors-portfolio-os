// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import {
  type Ai,
  EMBED_MODEL,
  FEHLER,
  handleAsk,
  MIN_SCORE,
  MODEL,
  NICHT_GEFUNDEN,
  type NoteMatch,
  type Notes,
  SYSTEM_PROMPT,
  toSwiss,
  TOP_K,
  userMessage,
} from './ipaAgent';

const ask = (body: unknown) =>
  new Request('https://silvanbrors.ch/api/ipa/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const VECTOR = [0.1, 0.2, 0.3];

const match = (score: number, datei: string, abschnitt: string, text: string): NoteMatch => ({
  id: `${datei}-${abschnitt}`,
  score,
  metadata: { datei, abschnitt, text },
});

const DOCKER = match(0.71, '3.3 – Docker.md', 'Lösungen › Aufgabe 1 – Begriffe', 'Image: Vorlage.');
const DOCKER_AGAIN = match(0.66, '3.3 – Docker.md', 'Lösungen › Aufgabe 1 – Begriffe', 'Teil 2.');
const GIT = match(0.58, '2.1 – Git & Versionierung.md', 'Übersicht', 'Git speichert Versionen.');
const WEAK = match(MIN_SCORE - 0.01, '4.2 – IT-Security.md', 'Übersicht', 'CIA.');

/** AI-Binding: Embedding-Modell liefert VECTOR, Sprachmodell die Antwort. */
function fakeAi(answer: unknown = { response: 'Ein Image ist die Vorlage.' }): Ai {
  return {
    run: vi.fn((model: string) =>
      Promise.resolve(model === EMBED_MODEL ? { data: [VECTOR], shape: [1, 3] } : answer),
    ),
  };
}

const fakeNotes = (matches: NoteMatch[]): Notes => ({
  query: vi.fn(() => Promise.resolve({ matches })),
});

describe('ipa agent (RAG über Silvans Notizen)', () => {
  it('answers from the matching excerpts and lists them as sources', async () => {
    const ai = fakeAi({ response: '  Ein Image ist die Vorlage.  ' });
    const notes = fakeNotes([DOCKER, DOCKER_AGAIN, GIT, WEAK]);

    const res = await handleAsk(ask({ frage: '  Image oder Container?  ' }), {
      AI: ai,
      NOTES: notes,
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({
      antwort: 'Ein Image ist die Vorlage.',
      quellen: [
        { datei: '3.3 – Docker.md', abschnitt: 'Lösungen › Aufgabe 1 – Begriffe' },
        { datei: '2.1 – Git & Versionierung.md', abschnitt: 'Übersicht' },
      ],
    });
    expect(ai.run).toHaveBeenNthCalledWith(1, EMBED_MODEL, { text: ['Image oder Container?'] });
    expect(notes.query).toHaveBeenCalledWith(VECTOR, { topK: TOP_K, returnMetadata: 'all' });
    expect(ai.run).toHaveBeenNthCalledWith(2, MODEL, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: userMessage('Image oder Container?', [
            {
              datei: '3.3 – Docker.md',
              abschnitt: 'Lösungen › Aufgabe 1 – Begriffe',
              text: 'Image: Vorlage.',
            },
            {
              datei: '3.3 – Docker.md',
              abschnitt: 'Lösungen › Aufgabe 1 – Begriffe',
              text: 'Teil 2.',
            },
            {
              datei: '2.1 – Git & Versionierung.md',
              abschnitt: 'Übersicht',
              text: 'Git speichert Versionen.',
            },
          ]),
        },
      ],
      max_tokens: 400,
    });
  });

  it('puts excerpts and question into the user message, weak matches stay out', () => {
    const msg = userMessage('Was ist Git?', [
      {
        datei: '2.1 – Git & Versionierung.md',
        abschnitt: 'Übersicht',
        text: 'Git speichert Versionen.',
      },
    ]);
    expect(msg).toBe(
      'Auszüge aus Silvans Lernnotizen:\n\n[1] 2.1 – Git & Versionierung › Übersicht\n' +
        'Git speichert Versionen.\n\nFrage: Was ist Git?',
    );
  });

  it('tells honestly when nothing in the notes matches, without calling the LLM', async () => {
    const ai = fakeAi();
    const res = await handleAsk(ask({ frage: 'Wie backe ich einen Kuchen?' }), {
      AI: ai,
      NOTES: fakeNotes([WEAK]),
    });

    expect(await res.json()).toEqual({ antwort: NICHT_GEFUNDEN, quellen: [] });
    expect(ai.run).toHaveBeenCalledTimes(1); // nur das Embedding
  });

  it('the prompt forbids giving the notes out verbatim', () => {
    expect(SYSTEM_PROMPT).toMatch(/nie wörtlich/);
    expect(SYSTEM_PROMPT).toMatch(/nur mit dem Wissen aus den Auszügen/);
  });

  it('writes Swiss German', async () => {
    expect(toSwiss('Grösse, Strasse, Maß, GROẞ')).toBe('Grösse, Strasse, Mass, GROSS');
    const res = await handleAsk(ask({ frage: 'Was ist ein Image?' }), {
      AI: fakeAi({ response: 'Gießen' }),
      NOTES: fakeNotes([DOCKER]),
    });
    expect(((await res.json()) as { antwort: string }).antwort).toBe('Giessen');
  });

  it.each([
    ['too short', { frage: ' ok ' }],
    ['too long', { frage: 'x'.repeat(301) }],
    ['no question', { question: 'Was ist Git?' }],
    ['not a string', { frage: 42 }],
    ['no JSON', 'frage=Was ist Git?'],
  ])('rejects invalid input: %s', async (_, body) => {
    const ai = fakeAi();
    const res = await handleAsk(ask(body), { AI: ai, NOTES: fakeNotes([DOCKER]) });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ fehler: FEHLER.invalid });
    expect(ai.run).not.toHaveBeenCalled();
  });

  it('without bindings: 503', async () => {
    for (const env of [{}, { AI: fakeAi() }, { NOTES: fakeNotes([]) }]) {
      const res = await handleAsk(ask({ frage: 'Was ist Git?' }), env);
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ fehler: FEHLER.unavailable });
    }
  });

  it('daily quota used up: 429 with a clear message', async () => {
    const ai: Ai = {
      run: () => Promise.reject(new Error('3036: you have used up your daily free allocation')),
    };
    const res = await handleAsk(ask({ frage: 'Was ist Git?' }), { AI: ai, NOTES: fakeNotes([]) });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ fehler: FEHLER.quota });
  });

  it('other errors and empty answers: unavailable', async () => {
    const broken: Ai = { run: () => Promise.reject(new Error('boom')) };
    const failed = await handleAsk(ask({ frage: 'Was ist Git?' }), {
      AI: broken,
      NOTES: fakeNotes([GIT]),
    });
    expect(failed.status).toBe(503);

    const empty = await handleAsk(ask({ frage: 'Was ist Git?' }), {
      AI: fakeAi({ response: ' ' }),
      NOTES: fakeNotes([GIT]),
    });
    expect(empty.status).toBe(502);
    expect(await empty.json()).toEqual({ fehler: FEHLER.unavailable });
  });

  it('gives up after the timeout', async () => {
    const slow: Ai = { run: () => new Promise(() => {}) };
    const res = await handleAsk(
      ask({ frage: 'Was ist Git?' }),
      { AI: slow, NOTES: fakeNotes([]) },
      10,
    );
    expect(res.status).toBe(504);
    expect(await res.json()).toEqual({ fehler: FEHLER.timeout });
  });
});

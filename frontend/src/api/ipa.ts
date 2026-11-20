import { API_URL } from './http';

/** Das lokale LLM ist langsam; das Backend bricht selbst nach 30 s ab. */
export const IPA_TIMEOUT_MS = 40_000;

export interface IpaSource {
  datei: string;
  abschnitt: string;
}

export type IpaResult =
  { ok: true; answer: string; sources: IpaSource[] } | { ok: false; message: string };

export const IPA_MESSAGES = {
  offline: 'Der Assistent ist gerade offline. Die Beispielfragen funktionieren trotzdem.',
  unreachable: 'Der Assistent ist gerade nicht erreichbar.',
  timeout: 'Der Assistent hat zu lange gebraucht. Versuch es nochmals.',
} as const;

const isString = (v: unknown): v is string => typeof v === 'string';

function parseAnswer(v: unknown): { answer: string; sources: IpaSource[] } | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (!isString(o.antwort) || !Array.isArray(o.quellen)) return null;
  const sources: IpaSource[] = [];
  for (const q of o.quellen as unknown[]) {
    if (typeof q !== 'object' || q === null) return null;
    const s = q as Record<string, unknown>;
    if (!isString(s.datei) || !isString(s.abschnitt)) return null;
    sources.push({ datei: s.datei, abschnitt: s.abschnitt });
  }
  return { answer: o.antwort, sources };
}

function errorMessage(v: unknown): string | null {
  if (typeof v !== 'object' || v === null) return null;
  const fehler = (v as Record<string, unknown>).fehler;
  return isString(fehler) && fehler.length > 0 ? fehler : null;
}

/**
 * Schickt eine Frage an `POST /api/ipa/ask`. Wirft nie: Fehler kommen als Text zurück,
 * den der Chat direkt anzeigt.
 */
export async function askIpa(
  question: string,
  baseUrl: string = API_URL,
  timeoutMs: number = IPA_TIMEOUT_MS,
): Promise<IpaResult> {
  if (!baseUrl) return { ok: false, message: IPA_MESSAGES.offline };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/ipa/ask`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ frage: question }),
    });
    const body: unknown = await res.json().catch(() => null);
    if (res.ok) {
      const parsed = parseAnswer(body);
      return parsed ? { ok: true, ...parsed } : { ok: false, message: IPA_MESSAGES.unreachable };
    }
    return { ok: false, message: errorMessage(body) ?? IPA_MESSAGES.unreachable };
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    return { ok: false, message: aborted ? IPA_MESSAGES.timeout : IPA_MESSAGES.unreachable };
  } finally {
    clearTimeout(timer);
  }
}

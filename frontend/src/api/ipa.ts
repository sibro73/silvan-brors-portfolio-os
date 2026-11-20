import { API_URL } from './http';

/**
 * Lokal: Eingabefeld für echte Fragen an ipa-assistant (über das Backend). Das Projekt ist
 * nicht öffentlich.
 */
export const IPA_LIVE = import.meta.env.VITE_IPA_LIVE === 'true';

/**
 * Live-Seite: Eingabefeld mit dem Übergangs-Assistenten (Pages Function mit Workers AI,
 * `server/ipaAgent.ts`). Er kennt Silvans Notizen nicht und sagt das unter jeder Antwort.
 */
export const IPA_AGENT = import.meta.env.VITE_IPA_AGENT === 'true';

/** Wohin Fragen gehen. `/` = gleiche Domain (Pages Function), sonst das Backend. */
export const IPA_URL = import.meta.env.VITE_IPA_URL || API_URL;

/** Das lokale LLM ist langsam; das Backend bricht selbst nach 30 s ab. */
export const IPA_TIMEOUT_MS = 40_000;

export interface IpaSource {
  datei: string;
  abschnitt: string;
}

export type IpaResult =
  | { ok: true; answer: string; sources: IpaSource[]; note?: string }
  | { ok: false; message: string };

export const IPA_MESSAGES = {
  offline: 'Der Assistent ist nicht erreichbar. Die Beispielfragen funktionieren trotzdem.',
  unreachable: 'Der Assistent ist gerade nicht erreichbar.',
  timeout: 'Der Assistent hat zu lange gebraucht. Versuch es nochmals.',
} as const;

const isString = (v: unknown): v is string => typeof v === 'string';

function parseAnswer(v: unknown): { answer: string; sources: IpaSource[]; note?: string } | null {
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
  return isString(o.hinweis) && o.hinweis.length > 0
    ? { answer: o.antwort, sources, note: o.hinweis }
    : { answer: o.antwort, sources };
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
  baseUrl: string = IPA_URL,
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

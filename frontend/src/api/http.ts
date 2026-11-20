/**
 * Basis-URL des Backends. In Produktion über `VITE_API_URL` gesetzt.
 * Fehlt sie, gibt es (ausser im Dev-Modus) gar keinen Request: die Seite zeigt die Daten aus `data/`.
 */
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');

/** So lange wartet die Seite höchstens auf das Backend. */
export const API_TIMEOUT_MS = 3000;

export interface JsonResponse {
  body: unknown;
  latencyMs: number;
}

/**
 * `GET <baseUrl><path>` als JSON. Wirft nie: ohne Backend, bei Fehlerstatus,
 * Timeout oder kaputtem JSON kommt `null` zurück.
 */
export async function getJson(
  baseUrl: string,
  path: string,
  timeoutMs: number = API_TIMEOUT_MS,
): Promise<JsonResponse | null> {
  if (!baseUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return { body, latencyMs: Math.round(performance.now() - started) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

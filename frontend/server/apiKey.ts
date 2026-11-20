/**
 * Schutz der Schreib-Endpunkte (Clipper, Agents) mit `X-Api-Key`, wie im Spring-Backend:
 * kein Key konfiguriert → 503, falscher oder fehlender Key → 401.
 * Verglichen werden SHA-256-Hashes in konstanter Zeit.
 */
import { json } from './db';

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

async function equalInConstantTime(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/** `null` = Zugriff erlaubt, sonst die Fehlerantwort. */
export async function checkApiKey(
  request: Request,
  expected: string | undefined,
): Promise<Response | null> {
  if (!expected) return json(503, { fehler: 'API-Key ist nicht eingerichtet.' });
  const given = request.headers.get('X-Api-Key') ?? '';
  if (!(await equalInConstantTime(given, expected)))
    return json(401, { fehler: 'Ungültiger API-Key.' });
  return null;
}

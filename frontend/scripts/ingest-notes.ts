/**
 * Liest Silvans IPA-Lernnotizen ein und speichert sie im Vectorize-Index `ipa-notes`.
 * Die Notizen kommen nie in dieses Repo: Der Text liegt nur im Index auf Cloudflare.
 *
 *   cd frontend
 *   $env:CLOUDFLARE_ACCOUNT_ID = '…'; $env:CLOUDFLARE_API_TOKEN = '…'   # PowerShell
 *   node --experimental-strip-types scripts/ingest-notes.ts [ordner]
 *
 * Ordner: Standard ist `../../ipa-assistant/lernunterlagen` (Projekt neben silvan-os).
 * Der Token braucht «Workers AI Read» und «Vectorize Edit».
 * Mit `--dry-run` werden die Abschnitte nur gezählt, nichts wird gesendet.
 * Mit `--out <datei>` werden die Abschnitte als JSON gespeichert (ausserhalb des Repos ablegen!).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { chunkNotes, embeddingText, type NoteChunk } from '../server/notesChunker.ts';

const INDEX = 'ipa-notes';
const EMBED_MODEL = '@cf/baai/bge-m3';
const BATCH = 20;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const outIndex = args.indexOf('--out');
const outFile = outIndex >= 0 ? args[outIndex + 1] : undefined;
const dir = resolve(
  args.find((a, i) => !a.startsWith('--') && i !== outIndex + 1) ??
    '../../ipa-assistant/lernunterlagen',
);

function readNotes(folder: string): NoteChunk[] {
  return readdirSync(folder, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md') && !e.name.startsWith('.'))
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) => chunkNotes(e.name, readFileSync(join(folder, e.name), 'utf8')));
}

async function cf(path: string, init: RequestInit): Promise<unknown> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) throw new Error('CLOUDFLARE_ACCOUNT_ID und CLOUDFLARE_API_TOKEN setzen.');
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  const body = (await res.json()) as { success: boolean; errors?: unknown; result?: unknown };
  if (!res.ok || !body.success) {
    throw new Error(`${path}: HTTP ${res.status} ${JSON.stringify(body.errors)}`);
  }
  return body.result;
}

async function embed(texts: string[]): Promise<number[][]> {
  const result = (await cf(`/ai/run/${EMBED_MODEL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts }),
  })) as { data: number[][] };
  return result.data;
}

async function main() {
  const chunks = readNotes(dir);
  const files = new Set(chunks.map((c) => c.datei)).size;
  console.log(`${files} Dateien, ${chunks.length} Abschnitte aus ${dir}`);
  if (outFile) {
    const records = chunks.map((c) => ({ ...c, embed: embeddingText(c) }));
    writeFileSync(outFile, JSON.stringify(records));
    console.log(`Abschnitte gespeichert: ${outFile}`);
  }
  if (dryRun || outFile) return;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const vectors = await embed(batch.map(embeddingText));
    const ndjson = batch
      .map((c, j) =>
        JSON.stringify({
          id: c.id,
          values: vectors[j],
          metadata: { datei: c.datei, abschnitt: c.abschnitt, text: c.text },
        }),
      )
      .join('\n');
    await cf(`/vectorize/v2/indexes/${INDEX}/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-ndjson' },
      body: ndjson,
    });
    console.log(`  ${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
  }
  console.log('Fertig. Gelöschte Abschnitte bleiben im Index: dann den Index neu anlegen.');
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

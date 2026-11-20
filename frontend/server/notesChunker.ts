/**
 * Zerlegt Silvans IPA-Lernnotizen (Markdown aus Obsidian) in Abschnitte für die Vektorsuche.
 *
 * Wird nur vom Einlese-Skript (`scripts/ingest-notes.ts`) benutzt. Die Notizen selbst liegen
 * im Projekt `ipa-assistant` und kommen nie in dieses Repo oder auf die Website, nur in den
 * Vectorize-Index auf Cloudflare.
 */

export interface NoteChunk {
  /** Stabil pro Datei und Position, z. B. `3.3-04`. Höchstens 64 Bytes (Vectorize). */
  id: string;
  /** Dateiname wie im lokalen Projekt, z. B. `3.3 – Docker.md`. */
  datei: string;
  /** Überschrift(en), z. B. `Lösungen › Aufgabe 5 – Eigenes Image`. */
  abschnitt: string;
  text: string;
}

export const MAX_CHARS = 1800;
const INTRO = 'Übersicht';

/** Kurzform für die ID: Nummer vor dem Gedankenstrich, sonst der ganze Name ohne `.md`. */
function filePrefix(datei: string): string {
  const base = datei.replace(/\.md$/i, '');
  const match = base.match(/^([\d.]+)\s*[–-]/);
  const prefix = match ? match[1] : base;
  return prefix.replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 40);
}

/** Teilt zu lange Abschnitte an Leerzeilen, ohne Codeblöcke zu zerreissen. */
function splitLong(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  for (const line of text.split('\n')) {
    if (line.trimStart().startsWith('```')) inFence = !inFence;
    if (!inFence && line.trim() === '' && current.join('\n').length >= maxChars / 2) {
      blocks.push(current.join('\n'));
      current = [];
      continue;
    }
    current.push(line);
  }
  if (current.length) blocks.push(current.join('\n'));

  const parts: string[] = [];
  let buf = '';
  for (const block of blocks) {
    if (buf && buf.length + block.length + 2 > maxChars) {
      parts.push(buf);
      buf = block;
    } else {
      buf = buf ? `${buf}\n\n${block}` : block;
    }
  }
  if (buf) parts.push(buf);
  // Ein einzelner riesiger Block (z. B. langer Code) wird hart gekürzt geteilt
  return parts.flatMap((p) =>
    p.length <= maxChars * 1.5
      ? [p]
      : Array.from({ length: Math.ceil(p.length / maxChars) }, (_, i) =>
          p.slice(i * maxChars, (i + 1) * maxChars),
        ),
  );
}

/** Abschnitte an `##`/`###`-Überschriften, `#` in Codeblöcken zählt nicht. */
export function chunkNotes(datei: string, markdown: string, maxChars = MAX_CHARS): NoteChunk[] {
  const sections: { path: string; lines: string[] }[] = [];
  const headings: string[] = [];
  let current = { path: INTRO, lines: [] as string[] };
  let inFence = false;

  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    if (line.trimStart().startsWith('```')) inFence = !inFence;
    const heading = !inFence ? line.match(/^(#{2,3})\s+(.+?)\s*$/) : null;
    if (heading) {
      sections.push(current);
      const level = heading[1].length - 2; // ## → 0, ### → 1
      headings.length = level;
      headings[level] = heading[2];
      current = { path: headings.filter(Boolean).join(' › '), lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  sections.push(current);

  const prefix = filePrefix(datei);
  const chunks: NoteChunk[] = [];
  for (const section of sections) {
    const text = section.lines.join('\n').trim();
    if (!text) continue;
    for (const part of splitLong(text, maxChars)) {
      const n = String(chunks.length + 1).padStart(2, '0');
      chunks.push({ id: `${prefix}-${n}`, datei, abschnitt: section.path, text: part.trim() });
    }
  }
  return chunks;
}

/** Text, aus dem das Embedding berechnet wird: Thema und Abschnitt helfen der Suche. */
export function embeddingText(chunk: NoteChunk): string {
  return `${chunk.datei.replace(/\.md$/i, '')} › ${chunk.abschnitt}\n\n${chunk.text}`;
}

// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { chunkNotes, embeddingText } from './notesChunker';

const NOTE = `Docker verpackt Anwendungen in Container.

**Aufgaben**

- Aufgabe 1 – Begriffe

## Lösungen

### Aufgabe 1 – Begriffe

Ein Image ist die Vorlage.

### Aufgabe 3 – Webserver

\`\`\`bash
docker run -d -p 8080:80 nginx
# Browser: http://localhost:8080
## kein Titel, nur Kommentar
\`\`\`

Danach stoppen.
`;

describe('chunkNotes', () => {
  it('splits at ## and ### headings and keeps the heading path', () => {
    const chunks = chunkNotes('3.3 – Docker.md', NOTE);

    expect(chunks.map((c) => [c.id, c.abschnitt])).toEqual([
      ['3.3-01', 'Übersicht'],
      ['3.3-02', 'Lösungen › Aufgabe 1 – Begriffe'],
      ['3.3-03', 'Lösungen › Aufgabe 3 – Webserver'],
    ]);
    expect(chunks[0].datei).toBe('3.3 – Docker.md');
    expect(chunks[1].text).toBe('Ein Image ist die Vorlage.');
  });

  it('ignores # lines inside code blocks', () => {
    const webserver = chunkNotes('3.3 – Docker.md', NOTE)[2];
    expect(webserver.text).toContain('# Browser: http://localhost:8080');
    expect(webserver.text).toContain('## kein Titel, nur Kommentar');
    expect(webserver.text).toContain('Danach stoppen.');
  });

  it('splits long sections at blank lines, never inside a code block', () => {
    const para = (n: number) => `Absatz ${n} ` + 'x'.repeat(300);
    const code = '```\n' + 'a\n\nb\n'.repeat(20) + '```';
    const md = `## Lang\n\n${[1, 2, 3].map(para).join('\n\n')}\n\n${code}\n\n${para(4)}`;

    const chunks = chunkNotes('1.1 – IPERKA.md', md, 700);

    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.abschnitt).toBe('Lang');
      expect((c.text.match(/```/g) ?? []).length % 2).toBe(0);
    }
    expect(chunks.map((c) => c.text).join('\n\n')).toContain('Absatz 4');
  });

  it('builds safe ids for files without a number', () => {
    const [chunk] = chunkNotes('Notizen ohne Nummer.md', 'Text');
    expect(chunk.id).toBe('Notizen-ohne-Nummer-01');
  });

  it('puts topic and section in front of the embedded text', () => {
    const [, begriffe] = chunkNotes('3.3 – Docker.md', NOTE);
    expect(embeddingText(begriffe)).toBe(
      '3.3 – Docker › Lösungen › Aufgabe 1 – Begriffe\n\nEin Image ist die Vorlage.',
    );
  });
});

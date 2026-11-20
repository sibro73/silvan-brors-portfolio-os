import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { IpaResult } from '../../api/ipa';
import { IpaAssistent } from './IpaAssistent';

function deferred() {
  let resolve!: (r: IpaResult) => void;
  const promise = new Promise<IpaResult>((r) => (resolve = r));
  return { promise, resolve };
}

const input = () => screen.getByRole('textbox', { name: 'Eigene Frage an den IPA-Assistenten' });
const send = () => screen.getByRole('button', { name: 'Fragen' });

describe('IpaAssistent live chat', () => {
  it('asks the backend and shows answer and sources', async () => {
    const pending = deferred();
    const ask = vi.fn(() => pending.promise);
    render(<IpaAssistent ask={ask} live />);

    await userEvent.type(input(), '  Was ist Docker?  ');
    await userEvent.click(send());

    expect(ask).toHaveBeenCalledWith('Was ist Docker?');
    expect(screen.getByText('Was ist Docker?')).toBeInTheDocument();
    expect(screen.getByText('denkt nach …')).toBeInTheDocument();
    expect(input()).toHaveValue('');
    expect(send()).toBeDisabled();

    pending.resolve({
      ok: true,
      answer: 'Docker verpackt Anwendungen in Container.',
      sources: [
        { datei: '3.3 – Docker.md', abschnitt: 'Grundlagen' },
        { datei: '3.3 – Docker.md', abschnitt: 'Images' },
      ],
    });

    expect(await screen.findByText(/verpackt Anwendungen/)).toBeInTheDocument();
    expect(
      screen.getByText('Quellen: 3.3 – Docker.md › Grundlagen · 3.3 – Docker.md › Images'),
    ).toBeInTheDocument();
    expect(screen.queryByText('denkt nach …')).toBeNull();
  });

  it('shows errors as a chat message', async () => {
    const ask = vi.fn(() =>
      Promise.resolve<IpaResult>({ ok: false, message: 'Der Assistent ist gerade offline.' }),
    );
    render(<IpaAssistent ask={ask} live />);

    await userEvent.type(input(), 'Was ist Git?{Enter}');

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Der Assistent ist gerade offline.',
    );
  });

  it('does not send questions shorter than 3 characters', async () => {
    const ask = vi.fn();
    render(<IpaAssistent ask={ask} live />);

    expect(send()).toBeDisabled();
    await userEvent.type(input(), 'ok{Enter}');

    expect(ask).not.toHaveBeenCalled();
    expect(input()).toHaveAttribute('maxlength', '300');
  });

  it('live without backend: says so, examples keep working', async () => {
    // In Tests ist VITE_API_URL leer: askIpa schickt nichts weg
    render(<IpaAssistent live />);

    await userEvent.type(input(), 'Was ist SQL?{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent(/nicht erreichbar/);

    await userEvent.click(screen.getByRole('button', { name: 'Merge oder Rebase?' }));
    expect(screen.getByText(/Rebase setzt die Commits/)).toBeInTheDocument();
  });

  it('on the live site: examples only, no input, honest note', () => {
    render(<IpaAssistent />);

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Fragen' })).toBeNull();
    expect(screen.getByText(/Läuft nur lokal · hier Beispielantworten/)).toBeInTheDocument();
  });

  it('on the live site with the notes RAG: input, greeting, sources under answers', async () => {
    const ask = vi.fn(() =>
      Promise.resolve<IpaResult>({
        ok: true,
        answer: 'Ein Image ist die Vorlage, ein Container läuft.',
        sources: [{ datei: '3.3 – Docker.md', abschnitt: 'Lösungen › Aufgabe 1 – Begriffe' }],
      }),
    );
    render(<IpaAssistent ask={ask} agent />);

    expect(screen.getByText(/Ich kenne Silvans IPA-Lernnotizen/)).toBeInTheDocument();
    expect(screen.getByText(/Cloudflare Workers AI \+ Vectorize/)).toBeInTheDocument();
    expect(screen.queryByText(/hier Beispielantworten/)).toBeNull();

    await userEvent.type(input(), 'Image oder Container?{Enter}');

    expect(await screen.findByText(/ein Container läuft/)).toBeInTheDocument();
    expect(
      screen.getByText('Quelle: 3.3 – Docker.md › Lösungen › Aufgabe 1 – Begriffe'),
    ).toBeInTheDocument();
  });
});

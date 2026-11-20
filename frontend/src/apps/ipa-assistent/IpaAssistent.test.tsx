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
    render(<IpaAssistent ask={ask} />);

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
    render(<IpaAssistent ask={ask} />);

    await userEvent.type(input(), 'Was ist Git?{Enter}');

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Der Assistent ist gerade offline.',
    );
  });

  it('does not send questions shorter than 3 characters', async () => {
    const ask = vi.fn();
    render(<IpaAssistent ask={ask} />);

    expect(send()).toBeDisabled();
    await userEvent.type(input(), 'ok{Enter}');

    expect(ask).not.toHaveBeenCalled();
    expect(input()).toHaveAttribute('maxlength', '300');
  });

  it('is offline without backend and keeps the examples working', async () => {
    // In Tests ist VITE_API_URL leer: askIpa schickt nichts weg
    render(<IpaAssistent />);

    await userEvent.type(input(), 'Was ist SQL?{Enter}');
    expect(await screen.findByRole('status')).toHaveTextContent(/offline/);

    await userEvent.click(screen.getByRole('button', { name: 'Merge oder Rebase?' }));
    expect(screen.getByText(/Rebase setzt die Commits/)).toBeInTheDocument();
  });
});

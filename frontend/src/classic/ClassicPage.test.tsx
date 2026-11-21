import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { redirectLegacyHash } from '../shared/route';
import ClassicPage from './ClassicPage';

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState(null, '', '/');
});

const projectNames = () =>
  within(screen.getByRole('list', { name: 'Projekte' }))
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent);

describe('ClassicPage', () => {
  it('has one h1, landmarks and the four sections with kickers', () => {
    render(<ClassicPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Silvan Brors · Zürich');
    for (const kicker of ['01 / Projekte', '02 / Werdegang', '03 / Skills', '04 / Kontakt']) {
      expect(screen.getByText(kicker)).toBeInTheDocument();
    }
    for (const id of ['projekte', 'werdegang', 'skills', 'kontakt']) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('filters projects with pressed chips', async () => {
    render(<ClassicPage />);
    expect(projectNames()).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'Alle' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'AI' }));
    expect(projectNames()).toEqual(['IPA-Lernassistent', 'Marketing-Agents']);
    expect(screen.getByRole('button', { name: 'AI' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Alle' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'Automatisierung' }));
    expect(projectNames()).toEqual(['Clipper', 'Marketing-Agents', 'shop-outreach']);
  });

  it('shows real data, keeps unknown placeholders', () => {
    render(<ClassicPage />);
    expect(screen.getByRole('link', { name: 'Lebenslauf (PDF)' })).toHaveAttribute(
      'href',
      '/media/lebenslauf.pdf',
    );
    expect(screen.getByRole('link', { name: 'silvan.brors@icloud.com' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clipper auf GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/sibro73/stream-clipper-script',
    );
    expect(screen.getByText('Danach: [Übernahme / nächster Schritt]')).toBeInTheDocument();
    expect(screen.getAllByText('[Screenshot]')).toHaveLength(7);
  });

  it('copies the e-mail and shows «Kopiert» for 1.8 s', async () => {
    const write = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: write },
      configurable: true,
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ClassicPage />);
    await act(async () => {
      screen.getByRole('button', { name: 'E-Mail kopieren' }).click();
    });
    expect(write).toHaveBeenCalledWith('silvan.brors@icloud.com');
    expect(screen.getByRole('button', { name: 'Kopiert' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1800));
    expect(screen.getByRole('button', { name: 'E-Mail kopieren' })).toBeInTheDocument();
  });

  it('shows a toast when copying is not possible', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    });
    render(<ClassicPage />);
    await userEvent.click(screen.getByRole('button', { name: 'E-Mail kopieren' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Kopieren nicht möglich');
  });

  it('old #klassisch links land on /klassisch', () => {
    window.history.replaceState(null, '', '/#klassisch');
    redirectLegacyHash();
    expect(window.location.pathname).toBe('/klassisch');
    expect(window.location.hash).toBe('');
  });
});

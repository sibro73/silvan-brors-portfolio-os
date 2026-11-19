import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { NOTIFICATION_HIDE_MS, NOTIFICATION_SHOW_MS } from './os/DesktopShell';

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('App (desktop)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it('starts with about, finder and terminal open, about in front', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: 'Über mich.txt' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Projekte' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'silvan — zsh — 80×24' })).toBeInTheDocument();
    expect(screen.getByTestId('active-app')).toHaveTextContent('TextEdit');
  });

  it('opens apps from the dock and shows their name in the menu bar', async () => {
    render(<App />);
    await user().click(screen.getByRole('button', { name: 'IPA-Assistent öffnen' }));
    expect(screen.getByRole('region', { name: 'IPA-Assistent' })).toBeInTheDocument();
    expect(screen.getByTestId('active-app')).toHaveTextContent('IPA-Assistent');
    expect(
      screen.getByRole('button', { name: 'IPA-Assistent öffnen (geöffnet)' }),
    ).toBeInTheDocument();
  });

  it('minimize hides a window, the dock brings it back', async () => {
    render(<App />);
    const about = screen.getByRole('region', { name: 'Über mich.txt' });
    await user().click(within(about).getByRole('button', { name: 'Fenster minimieren' }));
    expect(screen.queryByRole('region', { name: 'Über mich.txt' })).toBeNull();
    expect(screen.getByTestId('active-app')).toHaveTextContent('Finder');
    await user().click(screen.getByRole('button', { name: 'Über mich.txt' }));
    expect(screen.getByRole('region', { name: 'Über mich.txt' })).toBeInTheDocument();
  });

  it('the terminal can open apps', async () => {
    render(<App />);
    const u = user();
    await u.type(screen.getByLabelText('Befehl eingeben'), 'open lebenslauf{Enter}');
    advance(200);
    expect(screen.getByRole('region', { name: 'Lebenslauf.pdf' })).toBeInTheDocument();
    expect(screen.getByTestId('active-app')).toHaveTextContent('Vorschau');
  });

  it('shows the clipper notification after 4 s and hides it after 14 s', () => {
    render(<App />);
    expect(screen.queryByText('Neuer Clip ist fertig. Klick zum Ansehen.')).toBeNull();
    advance(NOTIFICATION_SHOW_MS);
    expect(screen.getByText('Neuer Clip ist fertig. Klick zum Ansehen.')).toBeInTheDocument();
    advance(NOTIFICATION_HIDE_MS - NOTIFICATION_SHOW_MS);
    expect(screen.queryByText('Neuer Clip ist fertig. Klick zum Ansehen.')).toBeNull();
  });

  it('clicking the notification opens the clipper chat', async () => {
    render(<App />);
    advance(NOTIFICATION_SHOW_MS);
    await user().click(screen.getByRole('button', { name: /Clipper Bot/ }));
    expect(screen.getByRole('region', { name: 'Telegram — Clipper Bot' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('the notification can be dismissed', async () => {
    render(<App />);
    advance(NOTIFICATION_SHOW_MS);
    await user().click(screen.getByRole('button', { name: 'Benachrichtigung schliessen' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('no notification if the clipper chat is already open', async () => {
    render(<App />);
    await user().click(screen.getByRole('button', { name: 'Telegram öffnen' }));
    advance(NOTIFICATION_SHOW_MS);
    expect(screen.queryByRole('status')).toBeNull();
  });
});

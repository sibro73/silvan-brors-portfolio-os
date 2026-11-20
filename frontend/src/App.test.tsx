import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DesktopView from './os/DesktopView';
import { NOTIFICATION_HIDE_MS, NOTIFICATION_SHOW_MS } from './os/DesktopShell';

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('desktop view', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it('starts with the welcome window in front and the terminal behind it', () => {
    render(<DesktopView />);
    const welcome = screen.getByRole('region', { name: 'Willkommen' });
    const terminal = screen.getByRole('region', { name: 'silvan — zsh — 80×24' });
    expect(Number(welcome.style.zIndex)).toBeGreaterThan(Number(terminal.style.zIndex));
    expect(welcome).toHaveStyle({ animationDelay: '300ms' });
    expect(screen.getByTestId('active-app')).toHaveTextContent('Willkommen');
    // Finder und Über mich sind zu, aber über die Schreibtisch-Icons erreichbar
    expect(screen.queryByRole('region', { name: 'Projekte' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Über mich.txt' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Über mich.txt' })).toBeInTheDocument();
  });

  it('opens apps from the dock and shows their name in the menu bar', async () => {
    render(<DesktopView />);
    await user().click(screen.getByRole('button', { name: 'IPA-Assistent öffnen' }));
    expect(screen.getByRole('region', { name: 'IPA-Assistent' })).toBeInTheDocument();
    expect(screen.getByTestId('active-app')).toHaveTextContent('IPA-Assistent');
    expect(
      screen.getByRole('button', { name: 'IPA-Assistent öffnen (geöffnet)' }),
    ).toBeInTheDocument();
  });

  it('minimize hides a window, the dock brings it back', async () => {
    render(<DesktopView />);
    const term = screen.getByRole('region', { name: 'silvan — zsh — 80×24' });
    await user().click(within(term).getByRole('button', { name: 'Fenster minimieren' }));
    expect(screen.queryByRole('region', { name: 'silvan — zsh — 80×24' })).toBeNull();
    await user().click(screen.getByRole('button', { name: 'Terminal öffnen (geöffnet)' }));
    expect(screen.getByRole('region', { name: 'silvan — zsh — 80×24' })).toBeInTheDocument();
    expect(screen.getByTestId('active-app')).toHaveTextContent('Terminal');
  });

  it('the terminal can open apps', async () => {
    render(<DesktopView />);
    const u = user();
    await u.type(screen.getByLabelText('Befehl eingeben'), 'open lebenslauf{Enter}');
    advance(200);
    expect(screen.getByRole('region', { name: 'Lebenslauf.pdf' })).toBeInTheDocument();
    expect(screen.getByTestId('active-app')).toHaveTextContent('Vorschau');
  });

  it('shows the clipper notification after 4 s and hides it after 14 s', () => {
    render(<DesktopView />);
    expect(screen.queryByText('Neuer Clip ist fertig. Klick zum Ansehen.')).toBeNull();
    advance(NOTIFICATION_SHOW_MS);
    expect(screen.getByText('Neuer Clip ist fertig. Klick zum Ansehen.')).toBeInTheDocument();
    advance(NOTIFICATION_HIDE_MS - NOTIFICATION_SHOW_MS);
    expect(screen.queryByText('Neuer Clip ist fertig. Klick zum Ansehen.')).toBeNull();
  });

  it('clicking the notification opens the clipper chat', async () => {
    render(<DesktopView />);
    advance(NOTIFICATION_SHOW_MS);
    await user().click(screen.getByRole('button', { name: /Clipper Bot/ }));
    expect(screen.getByRole('region', { name: 'Telegram — Clipper Bot' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('the notification can be dismissed', async () => {
    render(<DesktopView />);
    advance(NOTIFICATION_SHOW_MS);
    await user().click(screen.getByRole('button', { name: 'Benachrichtigung schliessen' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('no notification if the clipper chat is already open', async () => {
    render(<DesktopView />);
    await user().click(screen.getByRole('button', { name: 'Telegram öffnen' }));
    advance(NOTIFICATION_SHOW_MS);
    expect(screen.queryByRole('status')).toBeNull();
  });
});

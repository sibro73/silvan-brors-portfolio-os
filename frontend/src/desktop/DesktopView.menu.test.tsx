import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BOOT_MS } from './boot';
import DesktopView from './DesktopView';
import { initialWindows } from './initialWindows';
import { PREFERENCES_KEY } from './preferences';
import { WALLPAPER_KEY } from '../shared/wallpaper';

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
});
afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
});

/** Menüeintrag finden, egal ob normaler Eintrag, Radio oder Checkbox. */
function menuEntry(name: string | RegExp) {
  const menu = within(screen.getByRole('menu'));
  const found =
    menu.queryByRole('menuitem', { name }) ??
    menu.queryByRole('menuitemradio', { name }) ??
    menu.queryByRole('menuitemcheckbox', { name });
  if (!found) throw new Error(`Menüeintrag nicht gefunden: ${String(name)}`);
  return found;
}

async function choose(menu: string, item: string | RegExp) {
  await user.click(screen.getByRole('menuitem', { name: menu }));
  await user.click(menuEntry(item));
}

const visibleWindows = () =>
  screen.queryAllByRole('region').map((r) => r.getAttribute('aria-label'));
const terminalLog = () =>
  within(screen.getByRole('region', { name: 'silvan — zsh — 80×24' })).getByRole('log');

describe('menu actions in the running desktop', () => {
  it('Fenster → Alle minimieren hides every window', async () => {
    render(<DesktopView />);
    await choose('Fenster', 'Alle minimieren');
    expect(visibleWindows()).toEqual([]);
    expect(screen.getByTestId('active-app')).toHaveTextContent('Finder');
  });

  it('Fenster → Fenster anordnen tiles the open windows', async () => {
    render(<DesktopView />);
    await choose('Fenster', 'Fenster anordnen');
    const regions = screen.getAllByRole('region');
    const lefts = regions.map((r) => parseInt(r.style.left, 10)).sort((a, b) => a - b);
    expect(lefts[0]).toBe(12);
    expect(new Set(lefts).size).toBe(regions.length);
    regions.forEach((r) => expect(r.style.width).toMatch(/px$/));
  });

  it('Fenster → list brings a window to the front', async () => {
    render(<DesktopView />);
    await choose('Fenster', /silvan — zsh/);
    expect(screen.getByTestId('active-app')).toHaveTextContent('Terminal');
  });

  it('Silvan OS → Neu starten shows the boot screen and resets the desktop', async () => {
    render(<DesktopView />);
    await user.click(screen.getByRole('button', { name: 'IPA-Assistent öffnen' }));
    await choose('Fenster', 'Alle minimieren');
    await choose('Silvan OS', 'Neu starten …');
    expect(screen.getByRole('status', { name: 'Silvan OS startet neu' })).toBeInTheDocument();
    advance(BOOT_MS);
    expect(screen.queryByRole('status', { name: 'Silvan OS startet neu' })).toBeNull();
    expect(visibleWindows()).toHaveLength(initialWindows.length);
    expect(screen.queryByRole('region', { name: 'IPA-Assistent' })).toBeNull();
  });

  it('Silvan OS → Über Silvan OS shows version and stack', async () => {
    render(<DesktopView />);
    await choose('Silvan OS', 'Über Silvan OS');
    const win = screen.getByRole('region', { name: 'Über Silvan OS' });
    expect(win).toHaveTextContent(/Version \d+\.\d+\.\d+/);
    expect(win).toHaveTextContent('Spring Boot');
    expect(within(win).getByRole('link', { name: /Quellcode dieser Seite/ })).toHaveAttribute(
      'href',
      'https://github.com/sibro73/silvan-brors-portfolio-os',
    );
  });

  it('Hilfe → Terminal-Befehle opens the terminal and runs help once', async () => {
    render(<DesktopView />);
    await choose('Hilfe', 'Terminal-Befehle');
    expect(terminalLog()).toHaveTextContent('silvan@macbook ~ % help');
    expect(terminalLog()).toHaveTextContent('Befehle:');
    expect(screen.getByLabelText('Befehl eingeben')).toHaveFocus();

    // Schliessen und wieder öffnen führt den Befehl nicht erneut aus
    const term = screen.getByRole('region', { name: 'silvan — zsh — 80×24' });
    await user.click(within(term).getByRole('button', { name: 'Fenster schliessen' }));
    await user.click(screen.getByRole('button', { name: 'Terminal öffnen' }));
    expect(terminalLog()).not.toHaveTextContent('Befehle:');
  });

  it('Ablage → Neues Terminal-Fenster starts a fresh session', async () => {
    render(<DesktopView />);
    await user.type(screen.getByLabelText('Befehl eingeben'), 'whoami{Enter}');
    expect(terminalLog()).toHaveTextContent('silvan brors');
    await choose('Ablage', 'Neues Terminal-Fenster');
    expect(terminalLog()).not.toHaveTextContent('silvan brors');
    expect(screen.getByTestId('active-app')).toHaveTextContent('Terminal');
  });

  it('Hilfe → Tastenkürzel and Kontakt open their windows', async () => {
    render(<DesktopView />);
    await choose('Hilfe', 'Tastenkürzel');
    expect(screen.getByRole('region', { name: 'Tastenkürzel' })).toHaveTextContent('Alt+W');
    await choose('Hilfe', 'Kontakt');
    expect(screen.getByRole('region', { name: 'Neue E-Mail' })).toBeInTheDocument();
  });

  it('Bearbeiten → E-Mail-Adresse kopieren confirms with a toast', async () => {
    render(<DesktopView />);
    await choose('Bearbeiten', 'E-Mail-Adresse kopieren');
    expect(await screen.findByText('Kopiert')).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe('silvan.brors@icloud.com');
  });

  it('Darstellung: wallpaper and dark windows are applied and remembered across restarts', async () => {
    const { container } = render(<DesktopView />);
    const os = () => container.querySelector('.os');
    await choose('Darstellung', /Hintergrund: Gletscher/);
    await choose('Darstellung', /Dunkle Fenster/);
    expect(os()).toHaveAttribute('data-wallpaper', 'gletscher');
    expect(os()).toHaveAttribute('data-dark-windows', 'true');
    // Hintergrund unter dem gemeinsamen Key der Handy-Ansicht, «Dunkle Fenster» separat
    expect(window.localStorage.getItem(WALLPAPER_KEY)).toBe('gletscher');
    expect(JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) ?? '{}')).toEqual({
      darkWindows: true,
    });
    await choose('Silvan OS', 'Neu starten …');
    advance(BOOT_MS);
    expect(os()).toHaveAttribute('data-wallpaper', 'gletscher');
  });

  it('Klassische Ansicht leads to /klassisch', async () => {
    render(<DesktopView />);
    await choose('Silvan OS', 'Klassische Ansicht');
    expect(window.location.pathname).toBe('/klassisch');
    window.history.replaceState(null, '', '/');
  });
});

describe('keyboard shortcuts', () => {
  it('Alt+W closes and Alt+M minimizes the active window', () => {
    render(<DesktopView />);
    const first = screen.getByTestId('active-app').textContent;
    fireEvent.keyDown(document.body, { code: 'KeyM', altKey: true });
    expect(screen.getByTestId('active-app').textContent).not.toBe(first);
    const before = visibleWindows().length;
    fireEvent.keyDown(document.body, { code: 'KeyW', altKey: true });
    expect(visibleWindows()).toHaveLength(before - 1);
  });

  it('are ignored while typing in the terminal', () => {
    render(<DesktopView />);
    const before = visibleWindows().length;
    fireEvent.keyDown(screen.getByLabelText('Befehl eingeben'), { code: 'KeyW', altKey: true });
    expect(visibleWindows()).toHaveLength(before);
  });
});

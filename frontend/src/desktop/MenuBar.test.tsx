import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ActionId, OsActions } from './actions';
import type { MenuContext } from './menu.config';
import { MenuBar } from './MenuBar';
import { DEFAULT_PREFERENCES } from './preferences';
import { createInitialState } from './windowStore';

function mockActions(): OsActions {
  const fns = new Map<string, ReturnType<typeof vi.fn>>();
  return new Proxy({} as OsActions, {
    get: (_t, key: string) => {
      if (!fns.has(key)) fns.set(key, vi.fn());
      return fns.get(key);
    },
  });
}

const baseContext = (patch: Partial<MenuContext> = {}): MenuContext => ({
  state: createInitialState([
    { id: 'terminal', x: 0, y: 0 },
    { id: 'about', x: 0, y: 0 },
  ]),
  active: 'about',
  preferences: DEFAULT_PREFERENCES,
  fullscreen: false,
  fullscreenSupported: true,
  ...patch,
});

function setup(patch: Partial<MenuContext> = {}) {
  const actions = mockActions();
  const onSelectWindow = vi.fn();
  render(
    <MenuBar
      activeName="TextEdit"
      actions={actions}
      context={baseContext(patch)}
      onSelectWindow={onSelectWindow}
    />,
  );
  const trigger = (name: string) => screen.getByRole('menuitem', { name });
  return { actions, onSelectWindow, trigger };
}

const called = (actions: OsActions, id: ActionId) => actions[id] as ReturnType<typeof vi.fn>;

afterEach(() => {
  vi.useRealTimers();
});

describe('MenuBar basics', () => {
  it('shows the active app name', () => {
    setup();
    expect(screen.getByTestId('active-app')).toHaveTextContent('TextEdit');
  });

  it('ticks the clock every second', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-19T13:05:30Z'));
    setup();
    expect(screen.getByRole('button', { name: /^Kalender, .*14:05$/ })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByRole('button', { name: /^Kalender, .*14:06$/ })).toBeInTheDocument();
  });

  it('has a menu for every entry from menu.config', () => {
    setup();
    const names = within(screen.getByRole('menubar')).getAllByRole('menuitem');
    expect(names.map((n) => n.getAttribute('aria-label') ?? n.textContent)).toEqual([
      'Silvan OS',
      'Ablage',
      'Bearbeiten',
      'Darstellung',
      'Fenster',
      'Hilfe',
    ]);
  });
});

describe('MenuBar menus', () => {
  it('opens on click and closes with Escape, returning focus', async () => {
    const { trigger } = setup();
    await userEvent.click(trigger('Ablage'));
    const menu = screen.getByRole('menu');
    expect(trigger('Ablage')).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('menuitem', { name: 'Neues Terminal-Fenster' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger('Ablage')).toHaveFocus();
  });

  it('closes on a click outside', async () => {
    const { trigger } = setup();
    await userEvent.click(trigger('Bearbeiten'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('a second click on the trigger closes the menu', async () => {
    const { trigger } = setup();
    await userEvent.click(trigger('Hilfe'));
    await userEvent.click(trigger('Hilfe'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('switches between menus on hover while one is open', async () => {
    const { trigger } = setup();
    await userEvent.click(trigger('Ablage'));
    await userEvent.hover(trigger('Fenster'));
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAccessibleName('Fenster');
    expect(within(menu).getByRole('menuitem', { name: 'Alle minimieren' })).toBeInTheDocument();
  });

  it('does not open on hover when nothing is open', async () => {
    const { trigger } = setup();
    await userEvent.hover(trigger('Fenster'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('runs the action and closes', async () => {
    const { trigger, actions } = setup();
    await userEvent.click(trigger('Fenster'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Alle minimieren' }));
    expect(called(actions, 'minimize-all')).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('ignores disabled entries', async () => {
    const { trigger, actions } = setup({ active: null });
    await userEvent.click(trigger('Ablage'));
    const item = screen.getByRole('menuitem', { name: /Fenster schliessen/ });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(item);
    expect(called(actions, 'close-window')).not.toHaveBeenCalled();
  });

  it('lists open windows with a check on the active one', async () => {
    const { trigger, onSelectWindow } = setup();
    await userEvent.click(trigger('Fenster'));
    const about = screen.getByRole('menuitemradio', { name: /Über mich.txt/ });
    const term = screen.getByRole('menuitemradio', { name: /silvan — zsh/ });
    expect(about).toHaveAttribute('aria-checked', 'true');
    expect(term).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(term);
    expect(onSelectWindow).toHaveBeenCalledWith('terminal');
  });

  it('marks the chosen wallpaper and dark-window state', async () => {
    const { trigger } = setup({ preferences: { wallpaper: 'nacht', darkWindows: true } });
    await userEvent.click(trigger('Darstellung'));
    expect(screen.getByRole('menuitemradio', { name: /Hintergrund: Nacht/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: /Hintergrund: Abendrot/ })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('menuitemcheckbox', { name: /Dunkle Fenster/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});

describe('MenuBar keyboard', () => {
  it('ArrowDown opens and focuses the first item, arrows move, wrap around', async () => {
    const { trigger } = setup();
    trigger('Hilfe').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Terminal-Befehle' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Tastenkürzel' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Terminal-Befehle' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Kontakt' })).toHaveFocus();
  });

  it('ArrowRight/Left switch to the neighbour menu', async () => {
    const { trigger } = setup();
    trigger('Ablage').focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('menu')).toHaveAccessibleName('Bearbeiten');
    expect(screen.getByRole('menuitem', { name: 'E-Mail-Adresse kopieren' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('menu')).toHaveAccessibleName('Silvan OS');
  });

  it('Enter on an item runs it', async () => {
    const { trigger, actions } = setup();
    trigger('Hilfe').focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(called(actions, 'help-terminal')).toHaveBeenCalledOnce();
  });

  it('skips disabled items', async () => {
    const { trigger } = setup({ active: null });
    trigger('Fenster').focus();
    await userEvent.keyboard('{ArrowDown}');
    // «Minimieren» ist ohne aktives Fenster deaktiviert
    expect(screen.getByRole('menuitem', { name: 'Alle minimieren' })).toHaveFocus();
  });

  it('only one trigger is in the tab order', () => {
    setup();
    const tabbable = within(screen.getByRole('menubar'))
      .getAllByRole('menuitem')
      .filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
  });
});

describe('MenuBar status popovers', () => {
  it('Wi-Fi shows offline mode without a backend', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Verbindung: Offline-Modus' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Offline-Modus, zeige gespeicherte Daten');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('battery shows the apprenticeship placeholder', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Fortschritt der Lehre' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Lehrjahr [x] von 4');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Lehrjahr [x] von 4');
  });

  it('clock shows the month and upcoming events', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-11-19T10:00:00Z'));
    setup();
    await userEvent.click(screen.getByRole('button', { name: /^Kalender/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('November 2026')).toBeInTheDocument();
    expect(within(dialog).getByText('19')).toHaveAttribute('aria-current', 'date');
    expect(dialog).toHaveTextContent('Februar 2027');
    expect(dialog).toHaveTextContent('Steam Next Fest');
    expect(dialog).toHaveTextContent('Lehrabschluss');
  });

  it('opening a popover closes an open menu', async () => {
    const { trigger } = setup();
    await userEvent.click(trigger('Ablage'));
    await userEvent.click(screen.getByRole('button', { name: 'Fortschritt der Lehre' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from 'vitest';

import { type ActionDeps, createActions } from './actions';
import { DEFAULT_PREFERENCES } from './preferences';
import { createInitialState, type WindowActions } from './windowStore';

function setup(patch: Partial<ActionDeps> = {}) {
  const windows: WindowActions = {
    open: vi.fn(),
    close: vi.fn(),
    focus: vi.fn(),
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    move: vi.fn(),
    resize: vi.fn(),
    minimizeAll: vi.fn(),
    tile: vi.fn(),
  };
  const deps: ActionDeps = {
    getState: () =>
      createInitialState([
        { id: 'terminal', x: 0, y: 0 },
        { id: 'about', x: 0, y: 0 },
      ]),
    windows,
    openApp: vi.fn(),
    getDesktopArea: () => ({ width: 1200, height: 800 }),
    runInTerminal: vi.fn(),
    restart: vi.fn(),
    showClassic: vi.fn(),
    notify: vi.fn(),
    preferences: DEFAULT_PREFERENCES,
    setPreferences: vi.fn(),
    toggleFullscreen: vi.fn(),
    copyText: vi.fn(() => Promise.resolve()),
    location: { origin: 'https://silvanbrors.ch', pathname: '/' },
    ...patch,
  };
  return { deps, windows, actions: createActions(deps) };
}

describe('createActions', () => {
  it('window actions target the active window', () => {
    const { actions, windows } = setup();
    actions['close-window']();
    actions['minimize-window']();
    expect(windows.close).toHaveBeenCalledWith('about');
    expect(windows.minimize).toHaveBeenCalledWith('about');
  });

  it('window actions do nothing without an active window', () => {
    const { actions, windows } = setup({ getState: () => createInitialState([]) });
    actions['close-window']();
    expect(windows.close).not.toHaveBeenCalled();
  });

  it('minimize-all and tile go through the window store', () => {
    const { actions, windows } = setup();
    actions['minimize-all']();
    actions.tile();
    expect(windows.minimizeAll).toHaveBeenCalledOnce();
    expect(windows.tile).toHaveBeenCalledWith({ width: 1200, height: 800 });
  });

  it('opens the right apps', () => {
    const { actions, deps } = setup();
    actions['about-os']();
    actions['open-cv']();
    actions.shortcuts();
    actions.contact();
    expect(vi.mocked(deps.openApp).mock.calls.map((c) => c[0])).toEqual([
      'about-os',
      'cv',
      'shortcuts',
      'kontakt',
    ]);
  });

  it('terminal actions: fresh session and help command', () => {
    const { actions, deps } = setup();
    actions['new-terminal']();
    actions['help-terminal']();
    expect(deps.runInTerminal).toHaveBeenNthCalledWith(1, { fresh: true });
    expect(deps.runInTerminal).toHaveBeenNthCalledWith(2, { command: 'help' });
  });

  it('copies the e-mail address (placeholder) and confirms', async () => {
    const { actions, deps } = setup();
    actions['copy-email']();
    await vi.waitFor(() => expect(deps.notify).toHaveBeenCalledWith('Kopiert'));
    expect(deps.copyText).toHaveBeenCalledWith('silvan.brors@icloud.com');
  });

  it('copies the page link without hash', async () => {
    const { actions, deps } = setup();
    actions['copy-link']();
    await vi.waitFor(() => expect(deps.notify).toHaveBeenCalledWith('Kopiert'));
    expect(deps.copyText).toHaveBeenCalledWith('https://silvanbrors.ch/');
  });

  it('reports when copying fails', async () => {
    const { actions, deps } = setup({ copyText: () => Promise.reject(new Error('denied')) });
    actions['copy-email']();
    await vi.waitFor(() => expect(deps.notify).toHaveBeenCalledWith('Kopieren nicht möglich'));
  });

  it('downloads the CV as PDF', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { actions, deps } = setup();
    actions['download-cv']();
    expect(click).toHaveBeenCalledTimes(1);
    expect((click.mock.contexts[0] as HTMLAnchorElement).getAttribute('href')).toBe(
      '/media/lebenslauf.pdf',
    );
    expect(deps.notify).not.toHaveBeenCalled();
    click.mockRestore();
  });

  it('appearance actions update the preferences', () => {
    const { actions, deps } = setup();
    actions['wallpaper:casino']();
    actions['toggle-dark-windows']();
    expect(deps.setPreferences).toHaveBeenNthCalledWith(1, { wallpaper: 'casino' });
    expect(deps.setPreferences).toHaveBeenNthCalledWith(2, { darkWindows: true });
  });

  it('passes restart, classic view and fullscreen through', () => {
    const { actions, deps } = setup();
    actions.restart();
    actions.classic();
    actions.fullscreen();
    expect(deps.restart).toHaveBeenCalledOnce();
    expect(deps.showClassic).toHaveBeenCalledOnce();
    expect(deps.toggleFullscreen).toHaveBeenCalledOnce();
  });
});

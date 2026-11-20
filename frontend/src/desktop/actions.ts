import type { AppId } from './apps.registry';
import { profile } from '../data';
import { type Preferences, WALLPAPERS, type WallpaperId } from './preferences';
import { activeWindow, type Area, type DesktopState, type WindowActions } from './windowStore';

/** Alles, was Menü, Tastenkürzel und Terminal auslösen können. */
export type ActionId =
  | 'about-os'
  | 'classic'
  | 'restart'
  | 'new-terminal'
  | 'open-cv'
  | 'download-cv'
  | 'close-window'
  | 'minimize-window'
  | 'copy-email'
  | 'copy-link'
  | `wallpaper:${WallpaperId}`
  | 'toggle-dark-windows'
  | 'fullscreen'
  | 'minimize-all'
  | 'tile'
  | 'help-terminal'
  | 'shortcuts'
  | 'contact';

export interface ActionDeps {
  getState: () => DesktopState;
  windows: WindowActions;
  openApp: (id: AppId) => void;
  getDesktopArea: () => Area;
  /** Terminal öffnen; `fresh` = neue Sitzung, `command` = gleich ausführen. */
  runInTerminal: (options: { command?: string; fresh?: boolean }) => void;
  restart: () => void;
  showClassic: () => void;
  notify: (message: string) => void;
  preferences: Preferences;
  setPreferences: (patch: Partial<Preferences>) => void;
  toggleFullscreen: () => void;
  copyText?: (text: string) => Promise<void>;
  location?: Pick<Location, 'origin' | 'pathname'>;
}

export type OsActions = Record<ActionId, () => void>;

async function defaultCopy(text: string) {
  if (!navigator.clipboard?.writeText) throw new Error('Zwischenablage nicht verfügbar');
  await navigator.clipboard.writeText(text);
}

export function createActions(deps: ActionDeps): OsActions {
  const copy = (text: string) => {
    (deps.copyText ?? defaultCopy)(text).then(
      () => deps.notify('Kopiert'),
      () => deps.notify('Kopieren nicht möglich'),
    );
  };

  const withActive = (fn: (id: AppId) => void) => () => {
    const id = activeWindow(deps.getState());
    if (id) fn(id);
  };

  const wallpapers = Object.fromEntries(
    WALLPAPERS.map((w) => [`wallpaper:${w.id}`, () => deps.setPreferences({ wallpaper: w.id })]),
  ) as Record<`wallpaper:${WallpaperId}`, () => void>;

  return {
    'about-os': () => deps.openApp('about-os'),
    classic: deps.showClassic,
    restart: deps.restart,
    'new-terminal': () => deps.runInTerminal({ fresh: true }),
    'open-cv': () => deps.openApp('cv'),
    'download-cv': () => {
      const href = profile.cv.downloadHref;
      // Solange nur ein Platzhalter-Link da ist, nichts vortäuschen.
      if (href.startsWith('#')) {
        deps.notify('Das PDF ist noch nicht hochgeladen.');
        return;
      }
      const a = document.createElement('a');
      a.href = href;
      a.download = '';
      a.click();
    },
    'close-window': withActive(deps.windows.close),
    'minimize-window': withActive(deps.windows.minimize),
    'copy-email': () => copy(profile.contact.email),
    'copy-link': () => {
      const loc = deps.location ?? window.location;
      copy(`${loc.origin}${loc.pathname}`);
    },
    ...wallpapers,
    'toggle-dark-windows': () =>
      deps.setPreferences({ darkWindows: !deps.preferences.darkWindows }),
    fullscreen: deps.toggleFullscreen,
    'minimize-all': deps.windows.minimizeAll,
    tile: () => deps.windows.tile(deps.getDesktopArea()),
    'help-terminal': () => deps.runInTerminal({ command: 'help' }),
    shortcuts: () => deps.openApp('shortcuts'),
    contact: () => deps.openApp('kontakt'),
  };
}

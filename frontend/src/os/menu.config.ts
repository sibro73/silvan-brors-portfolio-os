import type { AppId } from '../apps.registry';
import type { ActionId } from './actions';
import { type Preferences, WALLPAPERS } from './preferences';
import type { DesktopState } from './windowStore';

/** Zustand, aus dem Häkchen und deaktivierte Einträge berechnet werden. */
export interface MenuContext {
  state: DesktopState;
  active: AppId | null;
  preferences: Preferences;
  fullscreen: boolean;
  fullscreenSupported: boolean;
}

export type MenuEntry =
  | {
      type: 'action';
      label: string;
      action: ActionId;
      /** Nur Anzeige, z. B. «⌥W». Die Tasten selbst stehen in shortcuts.ts. */
      shortcut?: string;
      /** `radio`/`checkbox`: zeigt ein Häkchen, wenn `checked` wahr ist. */
      kind?: 'radio' | 'checkbox';
      checked?: (ctx: MenuContext) => boolean;
      disabled?: (ctx: MenuContext) => boolean;
    }
  | { type: 'separator' }
  /** Platzhalter: hier stehen alle offenen Fenster. */
  | { type: 'open-windows' };

export interface MenuDefinition {
  id: string;
  label: string;
  /** Logo statt Text (Apfel-Menü). */
  logo?: boolean;
}

export interface MenuConfig extends MenuDefinition {
  entries: MenuEntry[];
}

const noActiveWindow = (ctx: MenuContext) => ctx.active === null;

export const MENUS: MenuConfig[] = [
  {
    id: 'logo',
    label: 'Silvan OS',
    logo: true,
    entries: [
      { type: 'action', label: 'Über Silvan OS', action: 'about-os' },
      { type: 'separator' },
      { type: 'action', label: 'Klassische Ansicht', action: 'classic' },
      { type: 'separator' },
      { type: 'action', label: 'Neu starten …', action: 'restart' },
    ],
  },
  {
    id: 'ablage',
    label: 'Ablage',
    entries: [
      { type: 'action', label: 'Neues Terminal-Fenster', action: 'new-terminal' },
      { type: 'separator' },
      { type: 'action', label: 'Lebenslauf öffnen', action: 'open-cv' },
      { type: 'action', label: 'Lebenslauf herunterladen (PDF)', action: 'download-cv' },
      { type: 'separator' },
      {
        type: 'action',
        label: 'Fenster schliessen',
        action: 'close-window',
        shortcut: '⌥W',
        disabled: noActiveWindow,
      },
    ],
  },
  {
    id: 'bearbeiten',
    label: 'Bearbeiten',
    entries: [
      { type: 'action', label: 'E-Mail-Adresse kopieren', action: 'copy-email' },
      { type: 'action', label: 'Link zu dieser Seite kopieren', action: 'copy-link' },
    ],
  },
  {
    id: 'darstellung',
    label: 'Darstellung',
    entries: [
      ...WALLPAPERS.map((w): MenuEntry => ({
        type: 'action',
        label: `Hintergrund: ${w.label}`,
        action: `wallpaper:${w.id}`,
        kind: 'radio',
        checked: (ctx) => ctx.preferences.wallpaper === w.id,
      })),
      { type: 'separator' },
      {
        type: 'action',
        label: 'Dunkle Fenster',
        action: 'toggle-dark-windows',
        kind: 'checkbox',
        checked: (ctx) => ctx.preferences.darkWindows,
      },
      {
        type: 'action',
        label: 'Vollbild',
        action: 'fullscreen',
        kind: 'checkbox',
        checked: (ctx) => ctx.fullscreen,
        disabled: (ctx) => !ctx.fullscreenSupported,
      },
    ],
  },
  {
    id: 'fenster',
    label: 'Fenster',
    entries: [
      {
        type: 'action',
        label: 'Minimieren',
        action: 'minimize-window',
        shortcut: '⌥M',
        disabled: noActiveWindow,
      },
      { type: 'action', label: 'Alle minimieren', action: 'minimize-all' },
      {
        type: 'action',
        label: 'Fenster anordnen',
        action: 'tile',
        disabled: noActiveWindow,
      },
      { type: 'separator' },
      { type: 'open-windows' },
    ],
  },
  {
    id: 'hilfe',
    label: 'Hilfe',
    entries: [
      { type: 'action', label: 'Terminal-Befehle', action: 'help-terminal' },
      { type: 'action', label: 'Tastenkürzel', action: 'shortcuts' },
      { type: 'separator' },
      { type: 'action', label: 'Kontakt', action: 'contact' },
    ],
  },
];

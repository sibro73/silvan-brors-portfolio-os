import { useCallback, useState } from 'react';

import {
  DEFAULT_WALLPAPER,
  loadWallpaper,
  saveWallpaper,
  useWallpaper,
  WALLPAPERS,
  type WallpaperId,
} from '../shared/wallpaper';

export { WALLPAPERS, type WallpaperId };

export interface Preferences {
  wallpaper: WallpaperId;
  darkWindows: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  wallpaper: DEFAULT_WALLPAPER,
  darkWindows: false,
};
/** Nur «Dunkle Fenster». Der Hintergrund liegt unter `silvanos-wall` (shared/wallpaper.ts). */
export const PREFERENCES_KEY = 'silvan-os:preferences';

/** localStorage kann fehlen oder werfen (privates Fenster, blockierte Website-Daten). */
function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadDarkWindows(): boolean {
  try {
    const raw = storage()?.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES.darkWindows;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFERENCES.darkWindows;
    const dark = (parsed as Record<string, unknown>).darkWindows;
    return typeof dark === 'boolean' ? dark : DEFAULT_PREFERENCES.darkWindows;
  } catch {
    return DEFAULT_PREFERENCES.darkWindows;
  }
}

function saveDarkWindows(darkWindows: boolean): void {
  try {
    storage()?.setItem(PREFERENCES_KEY, JSON.stringify({ darkWindows }));
  } catch {
    // Speichern ist nur Komfort. Ohne Speicher gilt die Auswahl bis zum Neuladen.
  }
}

export function loadPreferences(): Preferences {
  return { wallpaper: loadWallpaper(), darkWindows: loadDarkWindows() };
}

export function savePreferences(prefs: Preferences): void {
  saveWallpaper(prefs.wallpaper);
  saveDarkWindows(prefs.darkWindows);
}

export function usePreferences(): [Preferences, (patch: Partial<Preferences>) => void] {
  const [wallpaper, setWallpaper] = useWallpaper();
  const [darkWindows, setDarkWindows] = useState(loadDarkWindows);
  const update = useCallback(
    (patch: Partial<Preferences>) => {
      if (patch.wallpaper !== undefined) setWallpaper(patch.wallpaper);
      if (patch.darkWindows !== undefined) {
        setDarkWindows(patch.darkWindows);
        saveDarkWindows(patch.darkWindows);
      }
    },
    [setWallpaper],
  );
  return [{ wallpaper, darkWindows }, update];
}

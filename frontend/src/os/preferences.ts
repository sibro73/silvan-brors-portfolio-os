import { useCallback, useState } from 'react';

export const WALLPAPERS = [
  { id: 'aurora', label: 'Aurora' },
  { id: 'nacht', label: 'Nacht' },
  { id: 'abendrot', label: 'Abendrot' },
  { id: 'graphit', label: 'Graphit' },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]['id'];

export interface Preferences {
  wallpaper: WallpaperId;
  darkWindows: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = { wallpaper: 'aurora', darkWindows: false };
export const PREFERENCES_KEY = 'silvan-os:preferences';

const isWallpaper = (v: unknown): v is WallpaperId => WALLPAPERS.some((w) => w.id === v);

/** localStorage kann fehlen oder werfen (privates Fenster, blockierte Website-Daten). */
function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPreferences(): Preferences {
  try {
    const raw = storage()?.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFERENCES;
    const p = parsed as Record<string, unknown>;
    return {
      wallpaper: isWallpaper(p.wallpaper) ? p.wallpaper : DEFAULT_PREFERENCES.wallpaper,
      darkWindows:
        typeof p.darkWindows === 'boolean' ? p.darkWindows : DEFAULT_PREFERENCES.darkWindows,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Preferences): void {
  try {
    storage()?.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // Speichern ist nur Komfort. Ohne Speicher gilt die Auswahl bis zum Neuladen.
  }
}

export function usePreferences(): [Preferences, (patch: Partial<Preferences>) => void] {
  const [prefs, setPrefs] = useState(loadPreferences);
  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePreferences(next);
      return next;
    });
  }, []);
  return [prefs, update];
}

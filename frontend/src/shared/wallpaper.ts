import { useCallback, useSyncExternalStore } from 'react';

/** Hintergründe aus design/desktop.dc.html und design/mobile.dc.html, in beiden Ansichten gleich. */
export const WALLPAPERS = [
  { id: 'abend', label: 'Abendrot' },
  { id: 'nacht', label: 'Nacht' },
  { id: 'gletscher', label: 'Gletscher' },
  { id: 'casino', label: 'Casino' },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]['id'];

export const DEFAULT_WALLPAPER: WallpaperId = 'abend';
/** Gleicher Key in Desktop- und Handy-Ansicht. */
export const WALLPAPER_KEY = 'silvanos-wall';

export const isWallpaper = (v: unknown): v is WallpaperId => WALLPAPERS.some((w) => w.id === v);

/** localStorage kann fehlen oder werfen (privates Fenster, blockierte Website-Daten). */
export function loadWallpaper(): WallpaperId {
  try {
    const saved = window.localStorage.getItem(WALLPAPER_KEY);
    return isWallpaper(saved) ? saved : DEFAULT_WALLPAPER;
  } catch {
    return DEFAULT_WALLPAPER;
  }
}

const listeners = new Set<() => void>();
let current: WallpaperId | null = null;

function read(): WallpaperId {
  current ??= loadWallpaper();
  return current;
}

export function saveWallpaper(id: WallpaperId): void {
  current = id;
  try {
    window.localStorage.setItem(WALLPAPER_KEY, id);
  } catch {
    // Speichern ist nur Komfort. Ohne Speicher gilt die Auswahl bis zum Neuladen.
  }
  listeners.forEach((l) => l());
}

/** Nur für Tests: nächster Zugriff liest wieder aus localStorage. */
export function resetWallpaperCache(): void {
  current = null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Aktueller Hintergrund, geteilt zwischen allen Komponenten und beiden Ansichten. */
export function useWallpaper(): [WallpaperId, (id: WallpaperId) => void] {
  const wall = useSyncExternalStore(subscribe, read, () => DEFAULT_WALLPAPER);
  const set = useCallback((id: WallpaperId) => saveWallpaper(id), []);
  return [wall, set];
}

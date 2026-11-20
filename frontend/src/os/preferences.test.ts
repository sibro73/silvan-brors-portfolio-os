import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetWallpaperCache, WALLPAPER_KEY } from '../shared/wallpaper';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  PREFERENCES_KEY,
  savePreferences,
} from './preferences';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('preferences', () => {
  it('round-trips through localStorage', () => {
    savePreferences({ wallpaper: 'casino', darkWindows: true });
    resetWallpaperCache();
    expect(loadPreferences()).toEqual({ wallpaper: 'casino', darkWindows: true });
    expect(window.localStorage.getItem(WALLPAPER_KEY)).toBe('casino');
  });

  it('falls back to defaults for missing or broken data', () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    window.localStorage.setItem(PREFERENCES_KEY, '{kaputt');
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    window.localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ wallpaper: 'rosa', darkWindows: 'ja' }),
    );
    window.localStorage.setItem(WALLPAPER_KEY, 'rosa');
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('survives a storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(() => savePreferences({ wallpaper: 'nacht', darkWindows: false })).not.toThrow();
  });
});

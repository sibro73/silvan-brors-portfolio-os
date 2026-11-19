import { afterEach, describe, expect, it, vi } from 'vitest';

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
    savePreferences({ wallpaper: 'abendrot', darkWindows: true });
    expect(loadPreferences()).toEqual({ wallpaper: 'abendrot', darkWindows: true });
  });

  it('falls back to defaults for missing or broken data', () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    window.localStorage.setItem(PREFERENCES_KEY, '{kaputt');
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    window.localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ wallpaper: 'rosa', darkWindows: 'ja' }),
    );
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

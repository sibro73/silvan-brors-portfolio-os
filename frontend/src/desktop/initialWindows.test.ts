import { describe, expect, it } from 'vitest';

import { DOCK_GAP, ICON_COLUMN_GAP, ICON_COLUMN_HEIGHT } from './apps.registry';
import { initialWindows, layoutInitialWindows, MENU_BAR_HEIGHT } from './initialWindows';

const area = (w: number, h: number) => ({ width: w, height: h - MENU_BAR_HEIGHT });
const byId = (w: number, h: number) =>
  Object.fromEntries(layoutInitialWindows(area(w, h)).map((r) => [r.id, r]));

describe('initialWindows', () => {
  it('welcome behind, terminal in front (last = active)', () => {
    expect(initialWindows.map((w) => w.id)).toEqual(['welcome', 'terminal']);
  });

  it('full HD: welcome ~12 % / 7 %, 800 wide; terminal ~59 % / 40 %, 600 × 340', () => {
    const { welcome, terminal } = byId(1920, 1080);
    expect(welcome).toEqual({ id: 'welcome', x: 230, y: 48, width: 800, height: undefined });
    expect(terminal).toEqual({ id: 'terminal', x: 1133, y: 404, width: 600, height: 340 });
  });

  for (const [w, h] of [
    [2560, 1440],
    [1920, 1080],
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [900, 640],
  ]) {
    it(`${w} × ${h}: inside the desktop, clear of icons and dock, both visible`, () => {
      const { welcome, terminal } = byId(w, h);
      const desk = area(w, h);
      for (const r of [welcome, terminal]) {
        expect(r.x).toBeGreaterThanOrEqual(16);
        expect(r.y).toBeGreaterThanOrEqual(0);
        const right = r.y < ICON_COLUMN_HEIGHT ? desk.width - ICON_COLUMN_GAP : desk.width - 16;
        expect(r.x + r.width).toBeLessThanOrEqual(right);
      }
      expect(terminal.y + terminal.height!).toBeLessThanOrEqual(desk.height - DOCK_GAP);
      // mindestens die Hälfte des Willkommen-Fensters bleibt frei sichtbar
      const hidden = Math.max(0, welcome.x + welcome.width - terminal.x);
      expect(hidden).toBeLessThanOrEqual(welcome.width / 2);
      if (w >= 1024) expect(terminal.x).toBeGreaterThanOrEqual(welcome.x + welcome.width + 16);
    });
  }
});

import { describe, expect, it } from 'vitest';

import {
  activeWindow,
  clampPosition,
  createInitialState,
  type DesktopState,
  TILE_DOCK_SPACE,
  TILE_MIN_WIDTH,
  tileLayout,
  windowReducer,
} from './windowStore';

const initial = (): DesktopState =>
  createInitialState([
    { id: 'terminal', x: 700, y: 90 },
    { id: 'finder', x: 150, y: 380 },
    { id: 'about', x: 90, y: 40 },
  ]);

describe('createInitialState', () => {
  it('stacks windows in the given order (last on top)', () => {
    const s = initial();
    expect(s.windows.terminal?.z).toBe(1);
    expect(s.windows.finder?.z).toBe(2);
    expect(s.windows.about?.z).toBe(3);
    expect(s.nextZ).toBe(4);
    expect(activeWindow(s)).toBe('about');
  });
});

describe('open', () => {
  it('opens a new window at its default position on top', () => {
    const s = windowReducer(initial(), { type: 'open', id: 'rtr', x: 240, y: 40 });
    expect(s.windows.rtr).toEqual({ x: 240, y: 40, z: 4, minimized: false, maximized: false });
    expect(s.nextZ).toBe(5);
    expect(activeWindow(s)).toBe('rtr');
  });

  it('restores a minimized window and keeps its position', () => {
    let s = windowReducer(initial(), { type: 'move', id: 'finder', x: 10, y: 20, width: 600 });
    s = windowReducer(s, { type: 'minimize', id: 'finder' });
    s = windowReducer(s, { type: 'open', id: 'finder', x: 150, y: 380 });
    expect(s.windows.finder).toMatchObject({ x: 10, y: 20, minimized: false, z: 4 });
    expect(activeWindow(s)).toBe('finder');
  });
});

describe('focus', () => {
  it('brings a background window to the front', () => {
    const s = windowReducer(initial(), { type: 'focus', id: 'terminal' });
    expect(s.windows.terminal?.z).toBe(4);
    expect(s.nextZ).toBe(5);
    expect(activeWindow(s)).toBe('terminal');
  });

  it('does nothing if the window is already on top', () => {
    const before = initial();
    const s = windowReducer(before, { type: 'focus', id: 'about' });
    expect(s).toBe(before);
  });

  it('ignores closed windows', () => {
    const before = initial();
    expect(windowReducer(before, { type: 'focus', id: 'cv' })).toBe(before);
  });
});

describe('close', () => {
  it('removes the window', () => {
    const s = windowReducer(initial(), { type: 'close', id: 'about' });
    expect(s.windows.about).toBeUndefined();
    expect(activeWindow(s)).toBe('finder');
  });

  it('reopens a closed window at the default position', () => {
    let s = windowReducer(initial(), { type: 'move', id: 'about', x: 300, y: 300, width: 500 });
    s = windowReducer(s, { type: 'close', id: 'about' });
    s = windowReducer(s, { type: 'open', id: 'about', x: 90, y: 40 });
    expect(s.windows.about).toMatchObject({ x: 90, y: 40 });
  });
});

describe('minimize', () => {
  it('hides the window and passes focus to the next one', () => {
    const s = windowReducer(initial(), { type: 'minimize', id: 'about' });
    expect(s.windows.about?.minimized).toBe(true);
    expect(activeWindow(s)).toBe('finder');
  });

  it('returns null when every window is minimized', () => {
    let s = initial();
    for (const id of ['about', 'finder', 'terminal'] as const) {
      s = windowReducer(s, { type: 'minimize', id });
    }
    expect(activeWindow(s)).toBeNull();
  });
});

describe('toggleMaximize', () => {
  it('toggles maximized', () => {
    let s = windowReducer(initial(), { type: 'toggleMaximize', id: 'finder' });
    expect(s.windows.finder?.maximized).toBe(true);
    s = windowReducer(s, { type: 'toggleMaximize', id: 'finder' });
    expect(s.windows.finder?.maximized).toBe(false);
  });

  it('blocks moving while maximized', () => {
    const max = windowReducer(initial(), { type: 'toggleMaximize', id: 'finder' });
    const s = windowReducer(max, { type: 'move', id: 'finder', x: 0, y: 0, width: 600 });
    expect(s).toBe(max);
  });
});

describe('move / clampPosition', () => {
  it('moves the window', () => {
    const s = windowReducer(initial(), { type: 'move', id: 'about', x: 200, y: 120, width: 500 });
    expect(s.windows.about).toMatchObject({ x: 200, y: 120 });
  });

  it('never moves above the desktop top edge', () => {
    expect(clampPosition(10, -50, 500)).toEqual({ x: 10, y: 0 });
  });

  it('keeps at least 140 px visible on the left', () => {
    expect(clampPosition(-1000, 10, 500)).toEqual({ x: -360, y: 10 });
    expect(clampPosition(-360, 10, 500)).toEqual({ x: -360, y: 10 });
  });
});

describe('minimizeAll', () => {
  it('minimizes every open window', () => {
    const s = windowReducer(initial(), { type: 'minimizeAll' });
    expect(Object.values(s.windows).every((w) => w.minimized)).toBe(true);
    expect(activeWindow(s)).toBeNull();
  });

  it('the dock brings a single window back', () => {
    let s = windowReducer(initial(), { type: 'minimizeAll' });
    s = windowReducer(s, { type: 'open', id: 'finder', x: 0, y: 0 });
    expect(activeWindow(s)).toBe('finder');
    expect(s.windows.about?.minimized).toBe(true);
  });
});

describe('tile / tileLayout', () => {
  const area = { width: 1440, height: 872 };

  it('places windows side by side without overlap, above the dock', () => {
    const rects = tileLayout(3, area);
    expect(rects).toHaveLength(3);
    expect(new Set(rects.map((r) => r.y)).size).toBe(1);
    for (let i = 1; i < rects.length; i++) {
      expect(rects[i].x).toBeGreaterThanOrEqual(rects[i - 1].x + rects[i - 1].width);
    }
    const last = rects[2];
    expect(last.x + last.width).toBeLessThanOrEqual(area.width);
    expect(last.y + last.height).toBeLessThanOrEqual(area.height - TILE_DOCK_SPACE);
  });

  it('wraps into rows when windows would get narrower than the minimum', () => {
    const rects = tileLayout(6, { width: 1000, height: 800 });
    expect(rects.every((r) => r.width >= TILE_MIN_WIDTH)).toBe(true);
    expect(new Set(rects.map((r) => r.y)).size).toBeGreaterThan(1);
  });

  it('returns nothing for no windows', () => {
    expect(tileLayout(0, area)).toEqual([]);
  });

  it('tiles visible windows (back to front), skips minimized ones and un-maximizes', () => {
    let s = windowReducer(initial(), { type: 'toggleMaximize', id: 'finder' });
    s = windowReducer(s, { type: 'minimize', id: 'terminal' });
    s = windowReducer(s, { type: 'tile', area });
    const [first, second] = tileLayout(2, area);
    expect(s.windows.finder).toMatchObject({ ...first, maximized: false });
    expect(s.windows.about).toMatchObject(second);
    expect(s.windows.terminal?.width).toBeUndefined();
  });
});

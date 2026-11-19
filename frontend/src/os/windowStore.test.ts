import { describe, expect, it } from 'vitest';

import {
  activeWindow,
  clampPosition,
  createInitialState,
  type DesktopState,
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

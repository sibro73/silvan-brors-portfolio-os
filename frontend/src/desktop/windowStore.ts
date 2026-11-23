import { useMemo, useReducer } from 'react';

import type { AppId } from './apps.registry';

export interface WindowState {
  x: number;
  y: number;
  /** Stapelreihenfolge: höher = weiter vorne. */
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** Eigene Grösse (z. B. nach «Fenster anordnen»). Sonst gilt die Standardgrösse der App. */
  width?: number;
  height?: number;
}

export interface DesktopState {
  /** Nur offene Fenster (auch minimierte) haben einen Eintrag. */
  windows: Partial<Record<AppId, WindowState>>;
  /** Nächster freier z-Wert. */
  nextZ: number;
}

export type WindowAction =
  | { type: 'open'; id: AppId; x: number; y: number }
  | { type: 'close'; id: AppId }
  | { type: 'focus'; id: AppId }
  | { type: 'minimize'; id: AppId }
  | { type: 'toggleMaximize'; id: AppId }
  | { type: 'move'; id: AppId; x: number; y: number; width: number }
  | { type: 'resize'; id: AppId; rect: Rect }
  | { type: 'minimizeAll' }
  | { type: 'tile'; area: Area };

/** Verfügbare Fläche des Schreibtischs in px. */
export interface Area {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TILE_GAP = 12;
/** Unten frei für das Dock. */
export const TILE_DOCK_SPACE = 96;
export const TILE_MIN_WIDTH = 320;
export const TILE_MIN_HEIGHT = 200;

/**
 * Kachelt n Fenster nebeneinander: so viele Spalten wie Platz (mind. 320 px breit),
 * bei Bedarf in mehreren Reihen. Reihenfolge = Reihenfolge der Rechtecke.
 */
export function tileLayout(count: number, area: Area): Rect[] {
  if (count <= 0) return [];
  const usableW = Math.max(TILE_MIN_WIDTH, area.width - 2 * TILE_GAP);
  const usableH = Math.max(TILE_MIN_HEIGHT, area.height - TILE_GAP - TILE_DOCK_SPACE);
  const maxCols = Math.max(1, Math.floor((usableW + TILE_GAP) / (TILE_MIN_WIDTH + TILE_GAP)));
  const cols = Math.min(count, maxCols);
  const rows = Math.ceil(count / cols);
  const width = Math.floor((usableW - TILE_GAP * (cols - 1)) / cols);
  const height = Math.max(TILE_MIN_HEIGHT, Math.floor((usableH - TILE_GAP * (rows - 1)) / rows));
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: TILE_GAP + col * (width + TILE_GAP),
      y: TILE_GAP + row * (height + TILE_GAP),
      width,
      height,
    };
  });
}

/** Mindestens so viel vom Fenster bleibt links sichtbar, damit man es zurückholen kann. */
export const VISIBLE_EDGE = 140;

export function clampPosition(x: number, y: number, width: number): { x: number; y: number } {
  return {
    x: Math.max(-(width - VISIBLE_EDGE), x),
    y: Math.max(0, y),
  };
}

/** Kante oder Ecke, an der ein Fenster gezogen wird. */
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export const RESIZE_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

/** Kleinste Fenstergrösse beim Ziehen an den Kanten. */
export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 160;

/**
 * Neue Grösse beim Ziehen an einer Kante: Die gegenüberliegende Kante bleibt stehen.
 * Nie kleiner als die Mindestgrösse und nie über die Menüleiste (y ≥ 0).
 */
export function resizeRect(start: Rect, edge: ResizeEdge, dx: number, dy: number): Rect {
  let { x, y, width, height } = start;
  if (edge.includes('e')) width = Math.max(MIN_WINDOW_WIDTH, start.width + dx);
  if (edge.includes('s')) height = Math.max(MIN_WINDOW_HEIGHT, start.height + dy);
  if (edge.includes('w')) {
    const right = start.x + start.width;
    width = Math.max(MIN_WINDOW_WIDTH, start.width - dx);
    x = right - width;
  }
  if (edge.includes('n')) {
    const bottom = start.y + start.height;
    y = Math.max(0, Math.min(start.y + dy, bottom - MIN_WINDOW_HEIGHT));
    height = bottom - y;
  }
  return { x, y, width, height };
}

/** Offene Fenster in der gegebenen Reihenfolge (erstes = ganz hinten). */
export function createInitialState(open: { id: AppId; x: number; y: number }[]): DesktopState {
  const windows: DesktopState['windows'] = {};
  open.forEach((w, i) => {
    windows[w.id] = { x: w.x, y: w.y, z: i + 1, minimized: false, maximized: false };
  });
  return { windows, nextZ: open.length + 1 };
}

function patch(state: DesktopState, id: AppId, changes: Partial<WindowState>): DesktopState {
  const current = state.windows[id];
  if (!current) return state;
  return { ...state, windows: { ...state.windows, [id]: { ...current, ...changes } } };
}

export function windowReducer(state: DesktopState, action: WindowAction): DesktopState {
  switch (action.type) {
    case 'open': {
      const current = state.windows[action.id];
      const next: WindowState = current
        ? { ...current, minimized: false, z: state.nextZ }
        : { x: action.x, y: action.y, z: state.nextZ, minimized: false, maximized: false };
      return { windows: { ...state.windows, [action.id]: next }, nextZ: state.nextZ + 1 };
    }
    case 'close': {
      if (!state.windows[action.id]) return state;
      const windows = { ...state.windows };
      delete windows[action.id];
      return { ...state, windows };
    }
    case 'focus': {
      const current = state.windows[action.id];
      if (!current) return state;
      const isTop = Object.values(state.windows).every((w) => w.z <= current.z);
      if (isTop) return state;
      return { ...patch(state, action.id, { z: state.nextZ }), nextZ: state.nextZ + 1 };
    }
    case 'minimize':
      return patch(state, action.id, { minimized: true });
    case 'toggleMaximize': {
      const current = state.windows[action.id];
      if (!current) return state;
      return patch(state, action.id, { maximized: !current.maximized });
    }
    case 'minimizeAll': {
      const windows: DesktopState['windows'] = {};
      for (const [id, w] of Object.entries(state.windows) as [AppId, WindowState][]) {
        windows[id] = { ...w, minimized: true };
      }
      return { ...state, windows };
    }
    case 'tile': {
      // sichtbare Fenster, von hinten nach vorne
      const visible = (Object.entries(state.windows) as [AppId, WindowState][])
        .filter(([, w]) => !w.minimized)
        .sort(([, a], [, b]) => a.z - b.z);
      const rects = tileLayout(visible.length, action.area);
      const windows = { ...state.windows };
      visible.forEach(([id, w], i) => {
        windows[id] = { ...w, ...rects[i], maximized: false };
      });
      return { ...state, windows };
    }
    case 'resize': {
      const current = state.windows[action.id];
      if (!current || current.maximized) return state;
      return patch(state, action.id, action.rect);
    }
    case 'move': {
      const current = state.windows[action.id];
      if (!current || current.maximized) return state;
      return patch(state, action.id, clampPosition(action.x, action.y, action.width));
    }
  }
}

/** Das vorderste sichtbare (nicht minimierte) Fenster, sonst null. */
export function activeWindow(state: DesktopState): AppId | null {
  let top: AppId | null = null;
  let topZ = -Infinity;
  for (const [id, w] of Object.entries(state.windows) as [AppId, WindowState][]) {
    if (!w.minimized && w.z > topZ) {
      topZ = w.z;
      top = id;
    }
  }
  return top;
}

export interface WindowActions {
  open: (id: AppId, x: number, y: number) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  move: (id: AppId, x: number, y: number, width: number) => void;
  resize: (id: AppId, rect: Rect) => void;
  minimizeAll: () => void;
  tile: (area: Area) => void;
}

export function useWindowStore(init: () => DesktopState): [DesktopState, WindowActions] {
  const [state, dispatch] = useReducer(windowReducer, undefined, init);
  const actions = useMemo<WindowActions>(
    () => ({
      open: (id, x, y) => dispatch({ type: 'open', id, x, y }),
      close: (id) => dispatch({ type: 'close', id }),
      focus: (id) => dispatch({ type: 'focus', id }),
      minimize: (id) => dispatch({ type: 'minimize', id }),
      toggleMaximize: (id) => dispatch({ type: 'toggleMaximize', id }),
      move: (id, x, y, width) => dispatch({ type: 'move', id, x, y, width }),
      resize: (id, rect) => dispatch({ type: 'resize', id, rect }),
      minimizeAll: () => dispatch({ type: 'minimizeAll' }),
      tile: (area) => dispatch({ type: 'tile', area }),
    }),
    [],
  );
  return [state, actions];
}

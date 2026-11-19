import { useMemo, useReducer } from 'react';

import type { AppId } from '../apps.registry';

export interface WindowState {
  x: number;
  y: number;
  /** Stapelreihenfolge: höher = weiter vorne. */
  z: number;
  minimized: boolean;
  maximized: boolean;
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
  | { type: 'move'; id: AppId; x: number; y: number; width: number };

/** Mindestens so viel vom Fenster bleibt links sichtbar, damit man es zurückholen kann. */
export const VISIBLE_EDGE = 140;

export function clampPosition(x: number, y: number, width: number): { x: number; y: number } {
  return {
    x: Math.max(-(width - VISIBLE_EDGE), x),
    y: Math.max(0, y),
  };
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
    }),
    [],
  );
  return [state, actions];
}

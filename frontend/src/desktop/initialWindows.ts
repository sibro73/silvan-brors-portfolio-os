import { type AppId, DOCK_GAP, ICON_COLUMN_GAP, ICON_COLUMN_HEIGHT } from './apps.registry';
import type { Area } from './windowStore';

/** Höhe der Menüleiste: Prozentwerte beziehen sich auf den ganzen Bildschirm. */
export const MENU_BAR_HEIGHT = 28;

export interface InitialWindow {
  id: AppId;
  /** Abstand vom linken Rand, Anteil der Bildschirmbreite (0.12 = 12 %). */
  left: number;
  /** Abstand von oben, Anteil der Bildschirmhöhe (inkl. Menüleiste). */
  top: number;
  /** Breite: Zahl > 1 = px, sonst Anteil der Bildschirmbreite. */
  width: number;
  minWidth: number;
  maxWidth: number;
  /** Höhe in px. Fehlt sie, wächst das Fenster mit dem Inhalt (bis ans Dock). */
  height?: number;
  /** Kleinste Breite, wenn auf kleinen Bildschirmen Platz fehlt. */
  shrinkTo: number;
}

/**
 * Startanordnung beim Laden, von hinten nach vorne: das letzte Fenster ist aktiv.
 * Verschobene Fenster werden nicht gespeichert, nach dem Neuladen gilt wieder diese Anordnung.
 */
export const initialWindows: InitialWindow[] = [
  // Willkommen: links, direkt unter der Menüleiste, so hoch wie der Inhalt.
  // 800 px (≈ 42 % von 1920): Projektkarten in zwei Spalten, alles ohne Scrollen sichtbar.
  { id: 'welcome', left: 0.12, top: 0.07, width: 800, minWidth: 800, maxWidth: 800, shrinkTo: 480 },
  // Terminal: rechts unterhalb der Mitte, vorne und mit Fokus
  {
    id: 'terminal',
    left: 0.59,
    top: 0.4,
    width: 600,
    minWidth: 600,
    maxWidth: 600,
    height: 340,
    shrinkTo: 360,
  },
];

/** Mindestabstand zu Rändern und zwischen den Fenstern. */
const EDGE = 16;
const GAP = 16;
const MIN_HEIGHT = 220;

export interface InitialRect {
  id: AppId;
  x: number;
  y: number;
  width: number;
  height?: number;
}

/** Rechter Rand: Auf Höhe der Schreibtisch-Icons bleibt deren Spalte frei. */
const rightLimit = (area: Area, y: number) =>
  y < ICON_COLUMN_HEIGHT ? area.width - ICON_COLUMN_GAP : area.width - EDGE;

function place(cfg: InitialWindow, area: Area): InitialRect {
  const screenW = area.width;
  const screenH = area.height + MENU_BAR_HEIGHT;
  const wanted = cfg.width > 1 ? cfg.width : cfg.width * screenW;
  let width = Math.round(Math.min(cfg.maxWidth, Math.max(cfg.minWidth, wanted)));
  let y = Math.max(EDGE / 2, Math.round(cfg.top * screenH) - MENU_BAR_HEIGHT);
  let height = cfg.height;
  if (height !== undefined) {
    // nie unter das Dock
    const bottom = area.height - DOCK_GAP;
    if (y + height > bottom) y = Math.max(EDGE / 2, bottom - height);
    height = Math.max(MIN_HEIGHT, Math.min(height, bottom - y));
  }
  const right = rightLimit(area, y);
  width = Math.min(width, right - EDGE);
  const x = Math.max(EDGE, Math.min(Math.round(cfg.left * screenW), right - width));
  return { id: cfg.id, x, y, width, height };
}

/**
 * Rechnet die Startanordnung für die aktuelle Fläche (Schreibtisch ohne Menüleiste) aus.
 * Reicht der Platz nicht, rückt erst das hintere Fenster nach links, dann wird das vordere
 * schmaler, dann das hintere. Erst auf sehr kleinen Bildschirmen überlappen sie (beide sichtbar).
 */
export function layoutInitialWindows(
  area: Area,
  config: InitialWindow[] = initialWindows,
): InitialRect[] {
  const rects = config.map((cfg) => place(cfg, area));
  for (let i = 1; i < rects.length; i++) {
    const front = rects[i];
    const frontCfg = config[i];
    const back = rects[i - 1];
    const backCfg = config[i - 1];
    const fits = () => back.x + back.width + GAP <= front.x;
    if (fits()) continue;
    const right = rightLimit(area, front.y);
    const besideBack = () => {
      const x = back.x + back.width + GAP;
      if (right - x < frontCfg.shrinkTo) return false;
      front.x = x;
      front.width = Math.min(front.width, right - x);
      return true;
    };
    // 1. hinteres Fenster nach links
    back.x = Math.max(EDGE, front.x - GAP - back.width);
    if (fits()) continue;
    // 2. vorderes Fenster rechts daneben, schmaler
    if (besideBack()) continue;
    // 3. hinteres Fenster schmaler, damit das vordere daneben passt
    back.width = Math.max(backCfg.shrinkTo, right - frontCfg.shrinkTo - GAP - back.x);
    if (besideBack()) continue;
    // 4. zu wenig Platz: vorderes Fenster ganz rechts, überlappt (beide bleiben sichtbar)
    front.width = Math.min(
      front.width,
      Math.max(frontCfg.shrinkTo, right - EDGE - back.width),
      right - EDGE,
    );
    front.x = Math.max(EDGE, right - front.width);
  }
  return rects;
}

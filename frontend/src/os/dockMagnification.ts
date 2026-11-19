/** Grösster Faktor direkt unter der Maus. */
export const DOCK_MAX_SCALE = 1.6;
/** Ab diesem Abstand (px, Mitte zu Mitte) wächst ein Icon nicht mehr mit. */
export const DOCK_RANGE = 130;

/**
 * Vergrösserung eines Dock-Icons in Abhängigkeit vom horizontalen Abstand zur Maus.
 * Weicher Abfall (Kosinus), damit Nachbarn leicht mitwachsen wie bei macOS.
 */
export function dockScale(
  distance: number,
  maxScale: number = DOCK_MAX_SCALE,
  range: number = DOCK_RANGE,
): number {
  const d = Math.abs(distance);
  if (d >= range) return 1;
  const falloff = (Math.cos((Math.PI * d) / range) + 1) / 2;
  return 1 + (maxScale - 1) * falloff;
}

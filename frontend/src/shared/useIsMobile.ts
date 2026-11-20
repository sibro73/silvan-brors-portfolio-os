import { NARROW_QUERY, useMediaQuery } from '../os/useMediaQuery';

/** Unter 860 px Breite: Handy-Ansicht. Schaltet live um (matchMedia), nicht per CSS. */
export function useIsMobile(): boolean {
  return useMediaQuery(NARROW_QUERY);
}

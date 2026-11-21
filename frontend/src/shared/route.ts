import { useSyncExternalStore } from 'react';

/** Die klassische Portfolio-Seite. Alles andere ist Silvan OS (Desktop oder Handy). */
export const CLASSIC_PATH = '/klassisch';
export const HOME_PATH = '/';

const NAVIGATE_EVENT = 'silvanos:navigate';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

const current = () => window.location.pathname;

/** Aktueller Pfad, aktualisiert bei Links, Zurück und Vorwärts. */
export function usePathname(): string {
  return useSyncExternalStore(subscribe, current, () => HOME_PATH);
}

/** Wechselt die Seite ohne Neuladen. */
export function navigate(path: string): void {
  if (path === window.location.pathname) return;
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
  window.scrollTo?.(0, 0);
}

export const isClassicPath = (path: string) => path.replace(/\/+$/, '') === CLASSIC_PATH;

/** Alte Links auf `#klassisch` landen auf /klassisch. */
export function redirectLegacyHash(): void {
  if (window.location.hash === '#klassisch') {
    window.history.replaceState(null, '', CLASSIC_PATH);
  }
}

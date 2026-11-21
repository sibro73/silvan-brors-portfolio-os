import { lazy, Suspense } from 'react';

import { isClassicPath, redirectLegacyHash, usePathname } from './shared/route';
import { useIsMobile } from './shared/useIsMobile';

export { BOOT_MS, BOOT_MS_REDUCED_MOTION } from './desktop/boot';

// Je nur die Ansicht laden, die gebraucht wird: das Handy lädt keinen Desktop-Code.
const DesktopView = lazy(() => import('./desktop/DesktopView'));
const MobileOS = lazy(() => import('./mobile/MobileOS'));
const ClassicPage = lazy(() => import('./classic/ClassicPage'));

redirectLegacyHash();

/**
 * `/klassisch`: normale Portfolio-Seite (alle Geräte). Sonst Silvan OS: unter 860 px die
 * Handy-Ansicht, ab 860 px der Desktop, live umschaltend (matchMedia).
 */
export default function App() {
  const path = usePathname();
  const mobile = useIsMobile();
  const classic = isClassicPath(path);

  return (
    <Suspense
      fallback={
        <div
          className={classic ? 'view-loading view-loading--light' : 'view-loading'}
          aria-busy="true"
        />
      }
    >
      {classic ? <ClassicPage /> : mobile ? <MobileOS /> : <DesktopView />}
    </Suspense>
  );
}

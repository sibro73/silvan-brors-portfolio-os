import { lazy, Suspense } from 'react';

import { Classic } from './classic/Classic';
import { useIsMobile } from './shared/useIsMobile';
import { useHash } from './useHash';

export { BOOT_MS, BOOT_MS_REDUCED_MOTION } from './os/boot';

export const CLASSIC_HASH = '#klassisch';

// Je nur die Ansicht laden, die gebraucht wird: das Handy lädt keinen Desktop-Code.
const DesktopView = lazy(() => import('./os/DesktopView'));
const MobileOS = lazy(() => import('./mobile/MobileOS'));

/**
 * Unter 860 px die Handy-Ansicht, ab 860 px der Desktop. Schaltet live um (matchMedia).
 * `#klassisch` zeigt alles auf einer schlichten Seite.
 */
export default function App() {
  const hash = useHash();
  const mobile = useIsMobile();

  if (hash === CLASSIC_HASH) return <Classic />;
  return (
    <Suspense fallback={<div className="view-loading" aria-busy="true" />}>
      {mobile ? <MobileOS /> : <DesktopView />}
    </Suspense>
  );
}

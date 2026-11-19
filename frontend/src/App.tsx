import { useCallback, useEffect, useRef, useState } from 'react';

import { Classic } from './classic/Classic';
import { BootScreen } from './os/BootScreen';
import { DesktopShell } from './os/DesktopShell';
import { usePreferences } from './os/preferences';
import { NARROW_QUERY, REDUCED_MOTION_QUERY, useMediaQuery } from './os/useMediaQuery';
import { useHash } from './useHash';

export const CLASSIC_HASH = '#klassisch';
/** Dauer des Bootscreens bei «Neu starten». */
export const BOOT_MS = 1200;
export const BOOT_MS_REDUCED_MOTION = 300;

/** Wechsel zwischen Desktop, Mobile (gestapelte Fenster) und Klassischer Ansicht. */
export default function App() {
  const hash = useHash();
  const narrow = useMediaQuery(NARROW_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  // Einstellungen leben ausserhalb des Desktops und überstehen so einen Neustart.
  const [preferences, setPreferences] = usePreferences();
  const [bootCount, setBootCount] = useState(0);
  const [booting, setBooting] = useState(false);
  const bootTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(bootTimer.current ?? undefined), []);

  const restart = useCallback(() => {
    setBooting(true);
    clearTimeout(bootTimer.current ?? undefined);
    bootTimer.current = setTimeout(
      () => {
        // Neuer key = Desktop wird komplett neu aufgebaut (Startzustand).
        setBootCount((c) => c + 1);
        setBooting(false);
      },
      reducedMotion ? BOOT_MS_REDUCED_MOTION : BOOT_MS,
    );
  }, [reducedMotion]);

  if (hash === CLASSIC_HASH) return <Classic />;
  return (
    <>
      <DesktopShell
        key={bootCount}
        narrow={narrow}
        preferences={preferences}
        setPreferences={setPreferences}
        onRestart={restart}
      />
      {booting && <BootScreen />}
    </>
  );
}

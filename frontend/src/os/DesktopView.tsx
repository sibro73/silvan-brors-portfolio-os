import { useCallback, useEffect, useRef, useState } from 'react';

import { BOOT_MS, BOOT_MS_REDUCED_MOTION } from './boot';
import { BootScreen } from './BootScreen';
import { DesktopShell } from './DesktopShell';
import { usePreferences } from './preferences';
import { REDUCED_MOTION_QUERY, useMediaQuery } from './useMediaQuery';

/** Computer-Ansicht (ab 860 px): Desktop mit Fenstern, Menüleiste und Dock. */
export default function DesktopView() {
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

  return (
    <>
      <DesktopShell
        key={bootCount}
        preferences={preferences}
        setPreferences={setPreferences}
        onRestart={restart}
      />
      {booting && <BootScreen />}
    </>
  );
}

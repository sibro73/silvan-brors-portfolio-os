import { useCallback, useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange);
  return () => document.removeEventListener('fullscreenchange', onChange);
};

export function useFullscreen(): {
  supported: boolean;
  active: boolean;
  toggle: () => void;
} {
  const active = useSyncExternalStore(
    subscribe,
    () => Boolean(document.fullscreenElement),
    () => false,
  );
  const supported =
    typeof document !== 'undefined' &&
    typeof document.documentElement.requestFullscreen === 'function';

  const toggle = useCallback(() => {
    // Promises werden abgelehnt, wenn der Browser es verweigert. Dann passiert einfach nichts.
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  return { supported, active, toggle };
}

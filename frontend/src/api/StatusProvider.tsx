import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { status as fallbackStatus } from '../data';
import { StatusContext, type StatusState } from './statusContext';
import { fetchStatus, type StatusResult } from './status';

interface StatusProviderProps {
  children: ReactNode;
  /** Für Tests austauschbar. */
  load?: () => Promise<StatusResult>;
}

/** Lädt den Status einmal beim Start. Bis dahin (und bei Fehlern) gelten die Daten aus `data/`. */
export function StatusProvider({ children, load = fetchStatus }: StatusProviderProps) {
  const [result, setResult] = useState<StatusResult>({
    status: fallbackStatus,
    source: 'fallback',
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await load();
    setResult(next);
    setLoading(false);
  }, [load]);

  useEffect(() => {
    let active = true;
    load().then((next) => {
      if (!active) return;
      setResult(next);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const value = useMemo<StatusState>(
    () => ({ ...result, loading, refresh }),
    [result, loading, refresh],
  );
  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
}

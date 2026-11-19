import { createContext, useContext } from 'react';

import { status as fallbackStatus } from '../data';
import type { StatusResult } from './status';

export interface StatusState extends StatusResult {
  /** true, bis die erste Antwort (oder der Fallback) da ist. */
  loading: boolean;
  refresh: () => Promise<void>;
}

/** Ohne Provider (z. B. in Einzeltests): gespeicherte Daten. */
export const StatusContext = createContext<StatusState>({
  status: fallbackStatus,
  source: 'fallback',
  loading: false,
  refresh: async () => {},
});

export function useStatus(): StatusState {
  return useContext(StatusContext);
}

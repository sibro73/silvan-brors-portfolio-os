import { useEffect, useState } from 'react';

import { formatClock } from './clock';

export function useClock(): string {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return clock;
}

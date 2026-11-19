import { useCallback, useEffect, useRef, useState } from 'react';

type Phase = 'waiting' | 'shown' | 'done';

/**
 * Zeigt eine Benachrichtigung nach `showAfter` ms (ausser `suppressed` ist dann wahr)
 * und blendet sie nach `hideAfter` ms (ab Start) wieder aus. Einmal weg = weg.
 */
export function useTimedNotification(
  showAfter: number,
  hideAfter: number,
  suppressed: boolean,
): [visible: boolean, dismiss: () => void] {
  const [phase, setPhase] = useState<Phase>('waiting');
  const suppressedRef = useRef(suppressed);

  useEffect(() => {
    suppressedRef.current = suppressed;
  }, [suppressed]);

  useEffect(() => {
    const show = setTimeout(() => {
      setPhase((p) => (p === 'waiting' ? (suppressedRef.current ? 'done' : 'shown') : p));
    }, showAfter);
    const hide = setTimeout(() => setPhase('done'), hideAfter);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [showAfter, hideAfter]);

  const dismiss = useCallback(() => setPhase('done'), []);
  return [phase === 'shown', dismiss];
}

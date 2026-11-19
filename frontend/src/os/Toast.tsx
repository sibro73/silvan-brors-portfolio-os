import './Toast.css';

import { useEffect } from 'react';

export const TOAST_MS = 2000;

interface ToastProps {
  message: string;
  onDone: () => void;
}

/** Kurze Bestätigung (z. B. «Kopiert»), verschwindet von selbst. */
export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, TOAST_MS);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}

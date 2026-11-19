import './Desktop.css';

import type { ReactNode, Ref } from 'react';

import { APP_BY_ID, type AppId, DESKTOP_ORDER } from '../apps.registry';
import { DesktopIcon } from './DesktopIcon';

interface DesktopProps {
  /** Für die Grösse der Fläche (z. B. «Fenster anordnen»). */
  ref?: Ref<HTMLElement>;
  narrow: boolean;
  onOpen: (id: AppId) => void;
  /** Offene Fenster. Sie liegen in einer eigenen Stapel-Ebene unter Dock und Benachrichtigung. */
  windows?: ReactNode;
  /** Benachrichtigung und Dock. */
  children?: ReactNode;
}

export function Desktop({ ref, narrow, onOpen, windows, children }: DesktopProps) {
  return (
    <main
      ref={ref}
      aria-label="Schreibtisch"
      className={narrow ? 'desktop desktop--narrow' : 'desktop'}
    >
      <div className="desktop__icons">
        {DESKTOP_ORDER.map((id) => {
          const app = APP_BY_ID[id];
          if (!app.desktop) return null;
          return (
            <DesktopIcon
              key={id}
              label={app.desktop.label}
              icon={app.desktop}
              onOpen={() => onOpen(id)}
            />
          );
        })}
      </div>
      <div className="desktop__windows">{windows}</div>
      {children}
    </main>
  );
}

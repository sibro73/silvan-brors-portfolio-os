import './Desktop.css';

import type { ReactNode } from 'react';

import { APP_BY_ID, type AppId, DESKTOP_ORDER } from '../apps.registry';
import { DesktopIcon } from './DesktopIcon';

interface DesktopProps {
  narrow: boolean;
  onOpen: (id: AppId) => void;
  /** Fenster, Benachrichtigung und Dock. */
  children?: ReactNode;
}

export function Desktop({ narrow, onOpen, children }: DesktopProps) {
  return (
    <main aria-label="Schreibtisch" className={narrow ? 'desktop desktop--narrow' : 'desktop'}>
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
      {children}
    </main>
  );
}

import './Dock.css';

import { APP_BY_ID, type AppId, DOCK_ORDER } from '../apps.registry';
import { AppIcon } from './AppIcon';

interface DockProps {
  /** Apps mit offenem (auch minimiertem) Fenster bekommen einen Punkt. */
  running: ReadonlySet<AppId>;
  narrow: boolean;
  onOpen: (id: AppId) => void;
}

export function Dock({ running, narrow, onOpen }: DockProps) {
  return (
    <nav aria-label="Dock" className={narrow ? 'dock dock--narrow' : 'dock'}>
      {DOCK_ORDER.map((id) => {
        const app = APP_BY_ID[id];
        if (!app.icon || !app.dock) return null;
        const isRunning = running.has(id);
        return (
          <button
            key={id}
            type="button"
            className="dock__item"
            aria-label={`${app.dock} öffnen${isRunning ? ' (geöffnet)' : ''}`}
            title={app.dock}
            onClick={() => onOpen(id)}
          >
            <AppIcon background={app.icon.background} Glyph={app.icon.Glyph} />
            <span
              aria-hidden="true"
              className={isRunning ? 'dock__dot dock__dot--on' : 'dock__dot'}
              data-testid={`dot-${id}`}
            />
          </button>
        );
      })}
    </nav>
  );
}

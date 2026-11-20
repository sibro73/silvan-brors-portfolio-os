import './Dock.css';

import { type PointerEvent, useRef } from 'react';

import { APP_BY_ID, type AppId, DOCK_ORDER } from '../apps.registry';
import { AppIcon } from './AppIcon';
import { dockScale } from './dockMagnification';
import { REDUCED_MOTION_QUERY, useMediaQuery } from './useMediaQuery';

interface DockProps {
  /** Apps mit offenem (auch minimiertem) Fenster bekommen einen Punkt. */
  running: ReadonlySet<AppId>;
  onOpen: (id: AppId) => void;
}

export function Dock({ running, onOpen }: DockProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const magnify = !reducedMotion;
  const items = useRef(new Map<AppId, HTMLButtonElement>());

  // Direkt am DOM (CSS-Variable), damit nicht bei jeder Mausbewegung neu gerendert wird.
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!magnify || e.pointerType === 'touch') return;
    items.current.forEach((el) => {
      const r = el.getBoundingClientRect();
      const scale = dockScale(e.clientX - (r.left + r.width / 2));
      el.style.setProperty('--scale', scale.toFixed(3));
    });
  };

  const reset = () => {
    items.current.forEach((el) => el.style.removeProperty('--scale'));
  };

  const classes = ['dock'];
  if (magnify) classes.push('dock--magnify');

  return (
    <nav
      aria-label="Dock"
      className={classes.join(' ')}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {DOCK_ORDER.map((id) => {
        const app = APP_BY_ID[id];
        if (!app.icon || !app.dock) return null;
        const isRunning = running.has(id);
        return (
          <button
            key={id}
            ref={(el) => {
              if (el) items.current.set(id, el);
              else items.current.delete(id);
            }}
            type="button"
            className="dock__item"
            data-testid={`dock-${id}`}
            aria-label={`${app.dock} öffnen${isRunning ? ' (geöffnet)' : ''}`}
            onClick={() => onOpen(id)}
          >
            <span aria-hidden="true" className="dock__tooltip">
              {app.dock}
            </span>
            <span className="dock__icon">
              <AppIcon background={app.icon.background} Glyph={app.icon.Glyph} />
            </span>
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

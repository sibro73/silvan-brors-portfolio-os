import './Window.css';
import './windowTheme.css';

import { type CSSProperties, type PointerEvent, type ReactNode, useRef } from 'react';

import type { AppDefinition } from '../apps.registry';
import type { WindowActions, WindowState } from './windowStore';

interface WindowProps {
  app: AppDefinition;
  state: WindowState;
  /** Vorderstes Fenster: stärkerer Schatten. */
  active: boolean;
  actions: WindowActions;
  /** Verzögerung der Einblend-Animation (z. B. Willkommensfenster beim Start). */
  entranceDelayMs?: number;
  children?: ReactNode;
}

interface DragStart {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

const stop = (e: PointerEvent) => e.stopPropagation();

function windowStyle(app: AppDefinition, state: WindowState): CSSProperties {
  const z = 10 + state.z;
  if (state.maximized) {
    return {
      left: 8,
      top: 8,
      width: 'calc(100% - 16px)',
      height: 'calc(100% - 104px)',
      zIndex: z,
    };
  }
  const height = state.height ?? app.height;
  return {
    left: state.x,
    top: state.y,
    width: state.width ?? app.width,
    height,
    // Fenster mit Höhe «auto» nie unter das Dock wachsen lassen (Inhalt scrollt dann).
    maxHeight: height === 'auto' ? `max(200px, calc(100% - ${state.y + 96}px))` : undefined,
    zIndex: z,
  };
}

export function Window({ app, state, active, actions, entranceDelayMs, children }: WindowProps) {
  const drag = useRef<DragStart | null>(null);
  const canDrag = !state.maximized;

  const onTitlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canDrag || e.button !== 0) return;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: state.x,
      originY: state.y,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onTitlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    actions.move(
      app.id,
      d.originX + (e.clientX - d.startX),
      d.originY + (e.clientY - d.startY),
      state.width ?? app.width,
    );
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const classes = ['win'];
  if (app.dark) classes.push('win--dark');
  if (active) classes.push('win--active');
  if (canDrag) classes.push('win--draggable');
  if (app.themable) classes.push('win--themable');

  return (
    <section
      className={classes.join(' ')}
      aria-label={app.title}
      hidden={state.minimized}
      style={{
        ...windowStyle(app, state),
        animationDelay: entranceDelayMs ? `${entranceDelayMs}ms` : undefined,
      }}
      onPointerDown={() => actions.focus(app.id)}
      onFocus={() => actions.focus(app.id)}
      data-app={app.id}
    >
      <div
        className="win__titlebar"
        data-testid="titlebar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="win__lights">
          <button
            type="button"
            className="win__light win__light--close"
            aria-label="Fenster schliessen"
            onPointerDown={stop}
            onClick={() => actions.close(app.id)}
          >
            <span aria-hidden="true" />
          </button>
          <button
            type="button"
            className="win__light win__light--min"
            aria-label="Fenster minimieren"
            onPointerDown={stop}
            onClick={() => actions.minimize(app.id)}
          >
            <span aria-hidden="true" />
          </button>
          <button
            type="button"
            className="win__light win__light--max"
            aria-label={state.maximized ? 'Fenstergrösse wiederherstellen' : 'Fenster maximieren'}
            aria-pressed={state.maximized}
            onPointerDown={stop}
            onClick={() => actions.toggleMaximize(app.id)}
          >
            <span aria-hidden="true" />
          </button>
        </div>
        <span className="win__title">{app.title}</span>
      </div>
      <div className="win__body">{children}</div>
    </section>
  );
}

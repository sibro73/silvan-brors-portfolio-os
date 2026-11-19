import './Window.css';

import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useRef } from 'react';

import type { AppDefinition } from '../apps.registry';
import type { WindowActions, WindowState } from './windowStore';

interface WindowProps {
  app: AppDefinition;
  state: WindowState;
  /** Vorderstes Fenster: stärkerer Schatten. */
  active: boolean;
  /** Schmale Ansicht: Fenster gestapelt, kein Drag, kein Maximieren. */
  narrow: boolean;
  actions: WindowActions;
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

function windowStyle(app: AppDefinition, state: WindowState, narrow: boolean): CSSProperties {
  const z = 10 + state.z;
  if (narrow) {
    return {
      position: 'relative',
      width: '100%',
      height: app.height === 'auto' ? 'auto' : 420,
      zIndex: z,
    };
  }
  if (state.maximized) {
    return {
      left: 8,
      top: 8,
      width: 'calc(100% - 16px)',
      height: 'calc(100% - 104px)',
      zIndex: z,
    };
  }
  return { left: state.x, top: state.y, width: app.width, height: app.height, zIndex: z };
}

export function Window({ app, state, active, narrow, actions, children }: WindowProps) {
  const drag = useRef<DragStart | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const lastZ = useRef(state.z);
  const canDrag = !narrow && !state.maximized;

  // Gestapelt (mobil): ein neu geöffnetes oder nach vorne geholtes Fenster in den Blick scrollen.
  useEffect(() => {
    const raised = state.z > lastZ.current;
    lastZ.current = state.z;
    if (!narrow || !raised || state.minimized) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current?.scrollIntoView?.({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }, [narrow, state.z, state.minimized]);

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
      app.width,
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

  return (
    <section
      ref={sectionRef}
      className={classes.join(' ')}
      aria-label={app.title}
      hidden={state.minimized}
      style={windowStyle(app, state, narrow)}
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
            disabled={narrow}
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

import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';

import { BackChevron } from './icons';
import { MOBILE_APPS, type MobileAppId } from './mobileApps';

interface AppSheetProps {
  id: MobileAppId;
  /** Zoomt gerade zurück ins Icon. */
  closing: boolean;
  /** transform-origin: Mitte des angetippten Icons, relativ zum Bildschirm. */
  origin: string;
  onHome: () => void;
  children: ReactNode;
}

/** Geöffnete App, bildschirmfüllend. Zoomt aus dem Icon und beim Schliessen dorthin zurück. */
export function AppSheet({ id, closing, origin, onHome, children }: AppSheetProps) {
  const app = MOBILE_APPS[id];
  const back = useRef<HTMLButtonElement>(null);

  // Fokus in die App, damit Tastatur und Screenreader dort weitermachen
  useEffect(() => {
    back.current?.focus({ preventScroll: true });
  }, [id]);

  const style = {
    transformOrigin: origin,
    '--sheet-bg': app.bg,
    '--sheet-fg': app.fg,
    '--sheet-tint': app.tint,
  } as CSSProperties;

  return (
    <section
      className={`m-sheet ${closing ? 'm-sheet--out' : 'm-sheet--in'}`}
      aria-labelledby={`m-sheet-${id}`}
      style={style}
    >
      <header className="m-sheet__bar">
        <button ref={back} type="button" className="m-sheet__back" onClick={onHome}>
          <BackChevron />
          Home
        </button>
        <h1 id={`m-sheet-${id}`} className="m-sheet__title">
          {app.title}
        </h1>
        <span />
      </header>
      <div className="m-sheet__body">{children}</div>
      <button
        type="button"
        className="m-sheet__home"
        aria-label="Zum Home-Bildschirm"
        onClick={onHome}
      >
        <span />
      </button>
    </section>
  );
}

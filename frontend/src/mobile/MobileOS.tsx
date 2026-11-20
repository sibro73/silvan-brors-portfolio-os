import './mobile.css';

import {
  type ComponentType,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { projects } from '../shared/content';
import { useWallpaper } from '../shared/wallpaper';
import { Agents } from './apps/Agents';
import { Clipper } from './apps/Clipper';
import { Cv } from './apps/Cv';
import { Ipa } from './apps/Ipa';
import { Kalender } from './apps/Kalender';
import { Kontakt } from './apps/Kontakt';
import { Notes } from './apps/Notes';
import { Rtr } from './apps/Rtr';
import { Settings } from './apps/Settings';
import { Shop } from './apps/Shop';
import { Terminal } from './apps/Terminal';
import { Wetter } from './apps/Wetter';
import { AppSheet } from './AppSheet';
import { Dock } from './Dock';
import { HomeScreen } from './HomeScreen';
import { ClipperGlyph } from './icons';
import { isMobileAppId, type MobileAppId, type MobileAppProps } from './mobileApps';

/** Zeiten aus design/mobile.dc.html. */
export const CLOSE_MS = 250;
export const LONG_PRESS_MS = 600;
export const TOAST_MS = 1900;
export const NOTIFICATION_SHOW_MS = 6000;
export const NOTIFICATION_HIDE_MS = 14000;

const APPS: Record<MobileAppId, ComponentType<MobileAppProps>> = {
  rtr: Rtr,
  clipper: Clipper,
  ipa: Ipa,
  agents: Agents,
  wetter: Wetter,
  shop: Shop,
  cv: Cv,
  kalender: Kalender,
  settings: Settings,
  kontakt: Kontakt,
  notes: Notes,
  terminal: Terminal,
};

/** Merkt sich im Verlauf, dass eine App offen ist: Browser-Zurück schliesst sie. */
const HISTORY_KEY = 'silvanosApp';

/** Mitte eines Elements relativ zum Bildschirm, als transform-origin. */
function originOf(el: HTMLElement | undefined, root: HTMLElement | null): string {
  if (!el || !root) return '50% 50%';
  const a = el.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  if (!b.width || !b.height) return '50% 50%';
  const x = Math.round(((a.left + a.width / 2 - b.left) / b.width) * 100);
  const y = Math.round(((a.top + a.height / 2 - b.top) / b.height) * 100);
  return `${x}% ${y}%`;
}

/** Handy-Ansicht: Home-Bildschirm mit Widgets, App-Raster und Dock. Apps öffnen bildschirmfüllend. */
export default function MobileOS() {
  const [wall] = useWallpaper();
  const [app, setApp] = useState<MobileAppId | null>(null);
  const [closing, setClosing] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [jiggle, setJiggle] = useState(false);
  const [notification, setNotification] = useState(false);
  const [badge, setBadge] = useState(true);
  const [toastText, setToastText] = useState<string | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const historyPushed = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Aktuelle Werte für Timer und Event-Listener
  const state = useRef({ app, closing, jiggle, badge });
  useLayoutEffect(() => {
    state.current = { app, closing, jiggle, badge };
  });

  const close = useCallback(() => {
    if (!state.current.app || state.current.closing) return;
    setClosing(true);
    clearTimeout(closeTimer.current);
    // Erst nach der Zoom-Animation aushängen
    closeTimer.current = setTimeout(() => {
      setApp(null);
      setClosing(false);
    }, CLOSE_MS);
  }, []);

  const open = useCallback((id: MobileAppId, from?: HTMLElement) => {
    if (state.current.jiggle) return; // im Wackel-Modus löst Antippen nichts aus
    clearTimeout(closeTimer.current);
    setOrigin(originOf(from, root.current));
    const entry = { [HISTORY_KEY]: id };
    if (state.current.app && historyPushed.current) {
      window.history.replaceState(entry, '');
    } else {
      window.history.pushState(entry, '');
      historyPushed.current = true;
    }
    setApp(id);
    setClosing(false);
    if (id === 'clipper') {
      setNotification(false);
      setBadge(false);
    }
  }, []);

  /** Home-Button und Wischbalken: wie Browser-Zurück, damit der Verlauf stimmt. */
  const goHome = useCallback(() => {
    if (!state.current.app || state.current.closing) return;
    if (historyPushed.current) {
      window.history.back(); // → popstate → close
    } else {
      close();
    }
  }, [close]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const target: unknown = (e.state as Record<string, unknown> | null)?.[HISTORY_KEY];
      if (isMobileAppId(target) && target !== state.current.app) {
        // Vorwärts zu einer App (selten): einfach öffnen
        historyPushed.current = true;
        setApp(target);
        setClosing(false);
        return;
      }
      historyPushed.current = false;
      close();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [close]);

  // Mitteilung vom Clipper Bot: nach 6 s einblenden, nach 14 s wieder weg
  useEffect(() => {
    const show = setTimeout(() => {
      if (state.current.app !== 'clipper' && state.current.badge) setNotification(true);
    }, NOTIFICATION_SHOW_MS);
    const hide = setTimeout(() => setNotification(false), NOTIFICATION_HIDE_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(
    () => () => {
      clearTimeout(closeTimer.current);
      clearTimeout(pressTimer.current);
      clearTimeout(toastTimer.current);
    },
    [],
  );

  const toast = useCallback((text: string) => {
    clearTimeout(toastTimer.current);
    setToastText(text);
    toastTimer.current = setTimeout(() => setToastText(null), TOAST_MS);
  }, []);

  const pressStart = useCallback(() => {
    clearTimeout(pressTimer.current);
    if (!state.current.app) {
      pressTimer.current = setTimeout(() => setJiggle(true), LONG_PRESS_MS);
    }
  }, []);
  const pressEnd = useCallback(() => clearTimeout(pressTimer.current), []);

  const shown = app !== null && !closing;
  const Current = app ? APPS[app] : null;

  return (
    <div ref={root} className={`m-os m-wall-${wall} m-drift`}>
      <HomeScreen
        onOpen={open}
        behind={shown}
        jiggle={jiggle}
        badge={badge}
        onPressStart={pressStart}
        onPressEnd={pressEnd}
      />

      <div className="m-hint m-dockin" aria-hidden={shown}>
        <span>
          {jiggle ? 'Tippe auf «Fertig», um zu beenden' : 'Tippe auf eine App, um sie zu öffnen'}
        </span>
      </div>
      <Dock onOpen={open} />

      {jiggle && (
        <button type="button" className="m-done m-ln" onClick={() => setJiggle(false)}>
          Fertig
        </button>
      )}

      {notification && (
        <button type="button" className="m-nt" onClick={(e) => open('clipper', e.currentTarget)}>
          <span className="m-nt__icon" aria-hidden="true" style={{ width: 38, height: 38 }}>
            <span style={{ width: 20, height: 20, display: 'flex' }}>
              <ClipperGlyph width={2} />
            </span>
          </span>
          <span className="m-nt__body">
            <span className="m-nt__top">
              <b>{projects.clipper.botName}</b>
              <span className="m-nt__when">jetzt</span>
            </span>
            <span className="m-nt__text">{projects.clipper.notificationTouch}</span>
          </span>
        </button>
      )}

      {app && Current && (
        <AppSheet id={app} closing={closing} origin={origin} onHome={goHome}>
          <Current open={open} goHome={goHome} toast={toast} />
        </AppSheet>
      )}

      {toastText && (
        <div role="status" className="m-toast m-ln">
          {toastText}
        </div>
      )}
    </div>
  );
}

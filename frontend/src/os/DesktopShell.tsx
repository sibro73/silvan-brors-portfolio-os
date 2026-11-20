import './Desktop.css';

import { useCallback, useMemo, useState } from 'react';

import { APP_BY_ID, APPS, type AppId, defaultPosition, INITIAL_OPEN } from '../apps.registry';
import { projects } from '../data';
import { createActions } from './actions';
import type { TerminalRequest } from './appTypes';
import { Desktop } from './Desktop';
import { Dock } from './Dock';
import type { MenuContext } from './menu.config';
import { MenuBar } from './MenuBar';
import { Notification } from './Notification';
import type { Preferences } from './preferences';
import { useShortcuts } from './shortcuts';
import { Toast } from './Toast';
import { useFullscreen } from './useFullscreen';
import { useTimedNotification } from './useTimedNotification';
import { Window } from './Window';
import { activeWindow, type Area, createInitialState, useWindowStore } from './windowStore';

/** Benachrichtigung vom Clipper Bot: nach 4 s einblenden, nach 14 s wieder weg. */
export const NOTIFICATION_SHOW_MS = 4000;
export const NOTIFICATION_HIDE_MS = 14000;

const showClassic = () => {
  window.location.hash = '#klassisch';
};

/** Desktop = Fenster minus Menüleiste (28 px). */
const MENU_BAR_HEIGHT = 28;

const initState = () => {
  const desktop = { width: window.innerWidth, height: window.innerHeight - MENU_BAR_HEIGHT };
  return createInitialState(INITIAL_OPEN.map((id) => ({ id, ...defaultPosition(id, desktop) })));
};

interface DesktopShellProps {
  preferences: Preferences;
  setPreferences: (patch: Partial<Preferences>) => void;
  /** «Neu starten» im Logo-Menü. */
  onRestart: () => void;
}

interface TerminalChannel {
  /** Neue Sitzung = Terminal wird neu aufgebaut. */
  session: number;
  nonce: number;
  command?: string;
  handled: number;
}

/** Der ganze «Mac»: Menüleiste, Schreibtisch, Fenster, Benachrichtigung, Dock. */
export function DesktopShell({ preferences, setPreferences, onRestart }: DesktopShellProps) {
  const [state, windows] = useWindowStore(initState);
  const active = activeWindow(state);
  const running = new Set(Object.keys(state.windows) as AppId[]);
  // Element im State (Callback-Ref), damit Aktionen die Grösse lesen dürfen.
  const [deskEl, setDeskEl] = useState<HTMLElement | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const [terminal, setTerminal] = useState<TerminalChannel>({ session: 0, nonce: 0, handled: 0 });
  const fullscreen = useFullscreen();

  const [notificationVisible, dismissNotification] = useTimedNotification(
    NOTIFICATION_SHOW_MS,
    NOTIFICATION_HIDE_MS,
    Boolean(state.windows.clipper),
  );

  const getDesktopArea = useCallback((): Area => {
    const r = deskEl?.getBoundingClientRect();
    return r && r.width > 0
      ? { width: r.width, height: r.height }
      : { width: window.innerWidth, height: window.innerHeight - MENU_BAR_HEIGHT };
  }, [deskEl]);

  const openApp = useCallback(
    (id: AppId) => {
      const { x, y } = defaultPosition(id, getDesktopArea());
      windows.open(id, x, y);
      if (id === 'clipper') dismissNotification();
    },
    [windows, dismissNotification, getDesktopArea],
  );

  const runInTerminal = useCallback(
    ({ command, fresh }: { command?: string; fresh?: boolean }) => {
      setTerminal((t) => ({
        ...t,
        session: fresh ? t.session + 1 : t.session,
        nonce: command ? t.nonce + 1 : t.nonce,
        command: command ?? t.command,
      }));
      openApp('terminal');
    },
    [openApp],
  );

  const actions = useMemo(
    () =>
      createActions({
        getState: () => state,
        windows,
        openApp,
        getDesktopArea,
        runInTerminal,
        restart: onRestart,
        showClassic,
        notify: setToast,
        preferences,
        setPreferences,
        toggleFullscreen: fullscreen.toggle,
      }),
    [
      state,
      windows,
      openApp,
      getDesktopArea,
      runInTerminal,
      onRestart,
      preferences,
      setPreferences,
      fullscreen.toggle,
    ],
  );

  useShortcuts(actions);

  const terminalRequest = useMemo<TerminalRequest | undefined>(
    () =>
      terminal.command && terminal.nonce !== terminal.handled
        ? {
            nonce: terminal.nonce,
            command: terminal.command,
            onHandled: (nonce) => setTerminal((t) => ({ ...t, handled: nonce })),
          }
        : undefined,
    [terminal, setTerminal],
  );

  const menuContext: MenuContext = {
    state,
    active,
    preferences,
    fullscreen: fullscreen.active,
    fullscreenSupported: fullscreen.supported,
  };

  return (
    <div
      className="wall os"
      data-wallpaper={preferences.wallpaper}
      data-dark-windows={preferences.darkWindows}
    >
      <MenuBar
        activeName={active ? APP_BY_ID[active].menuName : 'Finder'}
        actions={actions}
        context={menuContext}
        onSelectWindow={openApp}
      />
      <Desktop
        ref={setDeskEl}
        onOpen={openApp}
        windows={APPS.map((app) => {
          const w = state.windows[app.id];
          if (!w) return null;
          const isTerminal = app.id === 'terminal';
          return (
            <Window
              key={app.id}
              app={app}
              state={w}
              active={active === app.id}
              actions={windows}
              entranceDelayMs={app.entranceDelayMs}
            >
              <app.component
                key={isTerminal ? `session-${terminal.session}` : undefined}
                openApp={openApp}
                closeSelf={() => windows.close(app.id)}
                terminalRequest={isTerminal ? terminalRequest : undefined}
              />
            </Window>
          );
        })}
      >
        {notificationVisible && APP_BY_ID.clipper.icon && (
          <Notification
            title={projects.clipper.botName}
            text={projects.clipper.notification}
            icon={APP_BY_ID.clipper.icon}
            onOpen={() => openApp('clipper')}
            onClose={dismissNotification}
          />
        )}
        <Dock running={running} onOpen={openApp} />
      </Desktop>
      {toast && <Toast message={toast} onDone={clearToast} />}
    </div>
  );
}

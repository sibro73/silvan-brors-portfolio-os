import './Desktop.css';

import { APP_BY_ID, APPS, type AppId, INITIAL_OPEN } from '../apps.registry';
import { projects } from '../data';
import { Desktop } from './Desktop';
import { Dock } from './Dock';
import { MenuBar } from './MenuBar';
import { Notification } from './Notification';
import { useTimedNotification } from './useTimedNotification';
import { Window } from './Window';
import { activeWindow, createInitialState, useWindowStore } from './windowStore';

/** Benachrichtigung vom Clipper Bot: nach 4 s einblenden, nach 14 s wieder weg. */
export const NOTIFICATION_SHOW_MS = 4000;
export const NOTIFICATION_HIDE_MS = 14000;

const initState = () =>
  createInitialState(INITIAL_OPEN.map((id) => ({ id, x: APP_BY_ID[id].x, y: APP_BY_ID[id].y })));

interface DesktopShellProps {
  /** Unter 860 px: Fenster gestapelt, kein Drag. */
  narrow: boolean;
}

/** Der ganze «Mac»: Menüleiste, Schreibtisch, Fenster, Benachrichtigung, Dock. */
export function DesktopShell({ narrow }: DesktopShellProps) {
  const [state, actions] = useWindowStore(initState);
  const active = activeWindow(state);
  const running = new Set(Object.keys(state.windows) as AppId[]);
  const [notificationVisible, dismissNotification] = useTimedNotification(
    NOTIFICATION_SHOW_MS,
    NOTIFICATION_HIDE_MS,
    Boolean(state.windows.clipper),
  );

  const openApp = (id: AppId) => {
    actions.open(id, APP_BY_ID[id].x, APP_BY_ID[id].y);
    if (id === 'clipper') dismissNotification();
  };

  return (
    <div className={narrow ? 'wall os os--narrow' : 'wall os'}>
      <MenuBar activeName={active ? APP_BY_ID[active].menuName : 'Finder'} />
      <Desktop narrow={narrow} onOpen={openApp}>
        {APPS.map((app) => {
          const w = state.windows[app.id];
          if (!w) return null;
          return (
            <Window
              key={app.id}
              app={app}
              state={w}
              active={active === app.id}
              narrow={narrow}
              actions={actions}
            >
              <app.component openApp={openApp} closeSelf={() => actions.close(app.id)} />
            </Window>
          );
        })}
        {notificationVisible && APP_BY_ID.clipper.icon && (
          <Notification
            title={projects.clipper.botName}
            text={projects.clipper.notification}
            icon={APP_BY_ID.clipper.icon}
            onOpen={() => openApp('clipper')}
            onClose={dismissNotification}
          />
        )}
        <Dock running={running} narrow={narrow} onOpen={openApp} />
      </Desktop>
    </div>
  );
}

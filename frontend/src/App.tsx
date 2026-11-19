import './os/Desktop.css';

import { APP_BY_ID, APPS, type AppId, INITIAL_OPEN } from './apps.registry';
import { Desktop } from './os/Desktop';
import { Dock } from './os/Dock';
import { projects } from './data';
import { MenuBar } from './os/MenuBar';
import { Notification } from './os/Notification';
import { useTimedNotification } from './os/useTimedNotification';
import { Window } from './os/Window';
import { activeWindow, createInitialState, useWindowStore } from './os/windowStore';

/** Benachrichtigung vom Clipper Bot: nach 4 s einblenden, nach 14 s wieder weg. */
export const NOTIFICATION_SHOW_MS = 4000;
export const NOTIFICATION_HIDE_MS = 14000;

const initState = () =>
  createInitialState(INITIAL_OPEN.map((id) => ({ id, x: APP_BY_ID[id].x, y: APP_BY_ID[id].y })));

export default function App() {
  const narrow = false;
  const [state, actions] = useWindowStore(initState);
  const active = activeWindow(state);
  const running = new Set(Object.keys(state.windows) as AppId[]);
  const clipperOpen = Boolean(state.windows.clipper);
  const [notificationVisible, dismissNotification] = useTimedNotification(
    NOTIFICATION_SHOW_MS,
    NOTIFICATION_HIDE_MS,
    clipperOpen,
  );

  const openApp = (id: AppId) => {
    actions.open(id, APP_BY_ID[id].x, APP_BY_ID[id].y);
    if (id === 'clipper') dismissNotification();
  };

  return (
    <div className="wall os">
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

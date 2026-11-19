import './os/Desktop.css';

import { APP_BY_ID, APPS, type AppId, INITIAL_OPEN } from './apps.registry';
import { Desktop } from './os/Desktop';
import { Dock } from './os/Dock';
import { MenuBar } from './os/MenuBar';
import { Window } from './os/Window';
import { activeWindow, createInitialState, useWindowStore } from './os/windowStore';

const initState = () =>
  createInitialState(INITIAL_OPEN.map((id) => ({ id, x: APP_BY_ID[id].x, y: APP_BY_ID[id].y })));

export default function App() {
  const narrow = false;
  const [state, actions] = useWindowStore(initState);
  const active = activeWindow(state);
  const running = new Set(Object.keys(state.windows) as AppId[]);
  const openApp = (id: AppId) => actions.open(id, APP_BY_ID[id].x, APP_BY_ID[id].y);

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
        <Dock running={running} narrow={narrow} onOpen={openApp} />
      </Desktop>
    </div>
  );
}

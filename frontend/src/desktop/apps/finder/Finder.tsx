import './Finder.css';

import { APP_BY_ID, FINDER_ORDER } from '../../apps.registry';
import { AppIcon } from '../../AppIcon';
import type { AppProps } from '../../appTypes';

export function Finder({ openApp }: AppProps) {
  return (
    <div className="finder">
      <nav aria-label="Seitenleiste" className="finder__sidebar">
        <span className="finder__heading">Favoriten</span>
        <span className="finder__place">Schreibtisch</span>
        <span className="finder__place finder__place--active" aria-current="page">
          Projekte
        </span>
        <span className="finder__place">Downloads</span>
        <span className="finder__heading finder__heading--spaced">Orte</span>
        <span className="finder__place">GitHub</span>
      </nav>
      <div className="finder__grid">
        {FINDER_ORDER.map((id) => {
          const app = APP_BY_ID[id];
          if (!app.icon || !app.finder) return null;
          return (
            <button key={id} type="button" className="finder__item" onClick={() => openApp(id)}>
              <AppIcon background={app.icon.background} Glyph={app.icon.Glyph} />
              <span className="finder__label">{app.finder}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

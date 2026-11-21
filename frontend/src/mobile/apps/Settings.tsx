import { OS_HOSTING, OS_STACK, profile, WALLPAPERS } from '../../shared/content';
import { CLASSIC_PATH } from '../../shared/route';
import { RouteLink } from '../../shared/RouteLink';
import { useWallpaper } from '../../shared/wallpaper';

/** Wie im Design: Frontend, Backend, Datenbank. */
const ROWS = OS_STACK.filter((s) => s.area !== 'Betrieb');

export function Settings() {
  const [wall, setWall] = useWallpaper();
  return (
    <div className="m-stack" style={{ gap: 22 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="m-group-label" style={{ paddingLeft: 14 }} id="m-walls">
          Hintergrund
        </span>
        <div className="m-list" role="radiogroup" aria-labelledby="m-walls">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              type="button"
              role="radio"
              aria-checked={wall === w.id}
              onClick={() => setWall(w.id)}
              style={{
                width: '100%',
                minHeight: 50,
                border: 0,
                borderBottom: '1px solid #E5E5EA',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 14px',
                fontSize: 16,
                color: '#1D1D1F',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                className={`m-wall-${w.id}`}
                style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }}
                aria-hidden="true"
              />
              <span style={{ flex: 1 }}>{w.label}</span>
              <span style={{ color: '#2F6FE4', fontWeight: 700 }} aria-hidden="true">
                {wall === w.id ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="m-group-label" style={{ paddingLeft: 14 }}>
          Über Silvan OS
        </span>
        <div className="m-list">
          <div className="m-list__row">
            <span>Version</span>
            <span className="m-muted" style={{ textAlign: 'right' }}>
              {__APP_VERSION__} · Portfolio-Edition
            </span>
          </div>
          {ROWS.map((r) => (
            <div key={r.area} className="m-list__row">
              <span>{r.area}</span>
              <span className="m-muted" style={{ textAlign: 'right' }}>
                {r.items}
              </span>
            </div>
          ))}
          <div className="m-list__row">
            <span>Quellcode</span>
            <a
              href={profile.source.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textAlign: 'right', textDecoration: 'none' }}
            >
              GitHub ↗
            </a>
          </div>
          <div className="m-list__row">
            <span>Läuft auf</span>
            <span className="m-muted" style={{ textAlign: 'right' }}>
              {OS_HOSTING}
            </span>
          </div>
        </div>
      </div>
      <div className="m-list">
        <RouteLink
          to={CLASSIC_PATH}
          className="m-list__row"
          style={{ minHeight: 50, alignItems: 'center', color: '#1D1D1F', textDecoration: 'none' }}
        >
          <span>Klassische Ansicht</span>
          <span style={{ color: '#C7C7CC', fontSize: 20 }} aria-hidden="true">
            ›
          </span>
        </RouteLink>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: '#6E6E73', padding: '0 14px' }}>
        Am Computer öffnet sich Silvan OS als Desktop mit Fenstern, Menüleiste und Dock.
      </p>
    </div>
  );
}

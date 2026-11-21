import { useStatus } from '../../api/statusContext';
import type { ProjectId } from '../../data';
import { profile, projects } from '../../shared/content';
import type { MobileAppId, MobileAppProps } from '../mobileApps';
import { CLASSIC_PATH } from '../../shared/route';
import { RouteLink } from '../../shared/RouteLink';

/** Projektkarten: Karte → App am Handy. */
const CARD_APPS: Record<string, MobileAppId> = {
  rtr: 'rtr',
  clipper: 'clipper',
  ipa: 'ipa',
  agents: 'agents',
};

/** Startseite als App: wie das Willkommensfenster am Desktop. */
export function Welcome({ open }: MobileAppProps) {
  const { status, source } = useStatus();
  const w = profile.welcome;
  const numbers: [string, string | number][] = [
    ['Wishlists', status.wishlists],
    ['Clips heute', status.clipsHeute],
    ['IPA-Fragen', status.ipaFragen],
    ['Letzter Bericht', status.letzterBericht],
  ];

  return (
    <div className="m-stack m-stack--16">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 className="m-h2" style={{ fontSize: 28 }}>
          {w.title}
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: '#6E6E73' }}>{w.subtitle}</p>
      </div>

      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
        {profile.intro.map((part, i) =>
          part.mark ? (
            <mark
              key={i}
              style={{ background: '#FFE08A', color: 'inherit', padding: '0 3px', borderRadius: 4 }}
            >
              {part.text}
            </mark>
          ) : (
            part.text
          ),
        )}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="m-group-label">Projekte</span>
        <div className="m-list">
          {projects.cards
            .filter((c) => c.app in CARD_APPS)
            .map((card) => (
              <button
                key={card.app}
                type="button"
                onClick={(e) => open(CARD_APPS[card.app], e.currentTarget)}
                style={{
                  width: '100%',
                  minHeight: 64,
                  border: 0,
                  borderBottom: '1px solid #E5E5EA',
                  background: '#FFFFFF',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  color: '#1D1D1F',
                  cursor: 'pointer',
                }}
              >
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <b style={{ fontSize: 16 }}>{card.title}</b>
                  <span style={{ fontSize: 14, color: '#3A3A3C' }}>{card.text}</span>
                  {card.app in projects.details && (
                    <span
                      style={{
                        fontSize: 12,
                        color: '#6E6E73',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {projects.details[card.app as ProjectId].tech.slice(0, 3).join(' · ')}
                    </span>
                  )}
                </span>
                <span aria-hidden="true" style={{ color: '#C7C7CC', fontSize: 20 }}>
                  ›
                </span>
              </button>
            ))}
        </div>
      </div>

      <div
        role="group"
        aria-label="Live-Zahlen"
        style={{ background: '#F2F2F7', borderRadius: 14, padding: '12px 14px' }}
      >
        <dl
          style={{
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '8px 12px',
          }}
        >
          {numbers.map(([label, value]) => (
            <div key={label}>
              <dt style={{ fontSize: 12, color: '#6E6E73' }}>{label}</dt>
              <dd style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{value}</dd>
            </div>
          ))}
        </dl>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6E6E73' }}>
          {source === 'live' ? 'live aus /api/status' : 'gespeicherte Daten'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" className="m-primary" onClick={(e) => open('cv', e.currentTarget)}>
          Lebenslauf
        </button>
        <button
          type="button"
          className="m-primary"
          style={{ background: '#F2F2F7', color: '#1D1D1F' }}
          onClick={(e) => open('kontakt', e.currentTarget)}
        >
          Kontakt
        </button>
        <RouteLink
          className="m-primary"
          to={CLASSIC_PATH}
          style={{
            background: '#F2F2F7',
            color: '#1D1D1F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          Klassische Ansicht
        </RouteLink>
      </div>
    </div>
  );
}

import { useStatus } from '../../api/statusContext';
import { projects } from '../../shared/content';
import type { MobileAppProps } from '../mobileApps';

const gold = '#F2C14E';

export function Rtr({ toast }: MobileAppProps) {
  const { status } = useStatus();
  const rtr = projects.rtr;
  return (
    <div className="m-stack m-stack--16">
      <div
        className="m-placeholder"
        style={{
          aspectRatio: '16 / 9',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.08)',
          border: '1px dashed rgba(255,255,255,0.3)',
          padding: 16,
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        {rtr.trailer}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 className="m-h2" style={{ fontSize: 28, letterSpacing: '-0.5px' }}>
          {rtr.title}
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>
          {rtr.description}
        </p>
      </div>
      <div className="m-chips">
        {rtr.tags.map((t) => (
          <span
            key={t}
            className="m-pill"
            style={{ background: 'rgba(242,193,78,0.18)', color: gold }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>Wishlists</span>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{status.wishlists}</span>
      </div>
      <button
        type="button"
        className="m-primary"
        style={{ background: gold, color: '#1D1D1F', fontWeight: 700 }}
        onClick={() => toast('Steam-Link folgt')}
      >
        {rtr.cta.label}
      </button>
    </div>
  );
}

import { projects } from '../../shared/content';

export function Wetter() {
  const w = projects.wetter;
  return (
    <div className="m-stack m-stack--16">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          padding: '16px 0 8px',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 500 }}>{w.title}</span>
        <span style={{ fontSize: 76, fontWeight: 200, letterSpacing: '-3px', lineHeight: 1.05 }}>
          {w.temperature}
        </span>
        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>{w.subtitle}</span>
      </div>
      <div
        style={{
          borderRadius: 18,
          background: 'rgba(255,255,255,0.14)',
          padding: 16,
          fontSize: 15,
        }}
      >
        {w.description}
      </div>
      <div
        className="m-placeholder"
        style={{
          aspectRatio: '4 / 3',
          borderRadius: 18,
          border: '1px dashed rgba(255,255,255,0.4)',
          color: 'rgba(255,255,255,0.8)',
        }}
      >
        {w.placeholder}
      </div>
    </div>
  );
}

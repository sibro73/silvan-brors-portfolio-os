import { projects } from '../../shared/content';
import { ProjectInfo } from '../ProjectInfo';

export function Shop() {
  const s = projects.shop;
  return (
    <div className="m-stack">
      <div className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 500 }}>
          {s.title}
        </span>
        <p style={{ margin: 0, fontSize: 15, color: '#3A3A3C' }}>{s.description}</p>
      </div>
      <div className="m-chips">
        {s.tags.map((t) => (
          <span key={t} className="m-pill" style={{ background: '#FBE4EF', color: '#8E1F57' }}>
            {t}
          </span>
        ))}
      </div>
      <ProjectInfo id="shop" link="#B02A6B" />
    </div>
  );
}

import { useAgentsReport } from '../../api/agentsReport';
import { ProjectInfo } from '../ProjectInfo';

export function Agents() {
  const report = useAgentsReport();
  return (
    <div className="m-stack">
      <span style={{ fontSize: 13, color: '#6E6E73' }}>
        {report.meta} {report.week}
      </span>
      <h2 className="m-h2">{report.title}</h2>
      <p style={{ margin: 0, fontSize: 15, color: '#3A3A3C' }}>{report.intro}</p>
      <div className="m-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {report.channels.map((ch, i) => (
          <div key={ch.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <b style={{ fontWeight: 600 }}>{ch.name}</b>
              <span style={{ color: '#6E6E73' }}>{ch.views}</span>
            </span>
            <div style={{ height: 8, borderRadius: 4, background: '#F2F2F7' }}>
              <div
                className="m-bar"
                style={{ width: `${ch.barWidth}%`, animationDelay: `${i * 0.1}s` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          background: '#FFF1E6',
          borderRadius: 16,
          padding: '14px 16px',
          fontSize: 15,
          color: '#6B3200',
        }}
      >
        <b>Empfehlung:</b> {report.recommendation}
      </div>
      {report.note && <span className="m-note">{report.note}</span>}
      <ProjectInfo id="agents" link="#C2570C" />
    </div>
  );
}

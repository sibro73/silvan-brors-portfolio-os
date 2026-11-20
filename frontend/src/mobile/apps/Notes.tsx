import { profile } from '../../shared/content';

/** Skills stehen in data/ klein (Terminal-Stil); in den Notizen wie im Design gross. */
const SKILL_LABEL: Record<string, string> = {
  java: 'Java',
  'spring boot': 'Spring Boot',
  rest: 'REST',
  sql: 'SQL',
  docker: 'Docker',
  linux: 'Linux',
  git: 'Git',
  'ci/cd': 'CI/CD',
  rag: 'RAG',
  agents: 'Agents',
  'claude code': 'Claude Code',
  unity: 'Unity',
  'c#': 'C#',
  python: 'Python',
};

const AREA_LABEL: Record<string, string> = {
  backend: 'Backend',
  devops: 'DevOps',
  ai: 'AI',
  sonst: 'Sonst',
};

export function Notes() {
  return (
    <div className="m-stack">
      <span style={{ fontSize: 13, color: '#8A7A3A', textAlign: 'center' }}>Über mich.txt</span>
      <h2 className="m-h2">{profile.greeting}</h2>
      <p style={{ margin: 0, fontSize: 16, color: '#6E6E73' }}>{profile.tagline}</p>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
        {profile.intro.map((part, i) => (part.mark ? <b key={i}>{part.text}</b> : part.text))}
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 15,
          padding: '14px 16px',
          borderRadius: 14,
          background: '#FFF6D6',
        }}
      >
        {profile.skills.map((s) => (
          <span key={s.area}>
            <b>{AREA_LABEL[s.area] ?? s.area}</b> ·{' '}
            {s.items
              .split(', ')
              .map((x) => SKILL_LABEL[x] ?? x)
              .join(', ')}
          </span>
        ))}
      </div>
      <span style={{ fontSize: 14, color: '#6E6E73' }}>{profile.tipMobile}</span>
    </div>
  );
}

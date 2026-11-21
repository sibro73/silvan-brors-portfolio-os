import type { ProjectId } from '../data';
import { projects } from '../shared/content';

/**
 * «Über das Projekt» unten in jeder Projekt-App: Beschreibung, so funktioniert es, Technik,
 * Repo-Link. Farben folgen der App (currentColor), damit es auf hell und dunkel passt.
 */
export function ProjectInfo({ id, link = '#2F6FE4' }: { id: ProjectId; link?: string }) {
  const d = projects.details[id];
  const muted = { opacity: 0.72 } as const;
  return (
    <section
      aria-labelledby={`m-pinfo-${id}`}
      style={{
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        background: 'rgba(127,127,127,0.12)',
        fontSize: 15,
        lineHeight: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        textAlign: 'left',
      }}
    >
      <h3 id={`m-pinfo-${id}`} style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
        Über das Projekt
      </h3>
      {d.tech.length > 0 && (
        <ul
          aria-label="Technologien"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {d.tech.map((t) => (
            <li
              key={t}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(127,127,127,0.18)',
              }}
            >
              {t}
            </li>
          ))}
        </ul>
      )}
      {d.summary.map((p) => (
        <p key={p} style={{ margin: 0 }}>
          {p}
        </p>
      ))}
      {d.points.length > 0 && (
        <>
          <h4
            style={{
              margin: '6px 0 0',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              ...muted,
            }}
          >
            So funktioniert es
          </h4>
          <ul
            style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            {d.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}
      {d.repo ? (
        <a
          href={d.repo.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: 600,
            color: link,
            textDecoration: 'none',
          }}
        >
          GitHub: {d.repo.label} ↗
        </a>
      ) : (
        d.codeNote && <p style={{ margin: 0, fontSize: 13, ...muted }}>{d.codeNote}</p>
      )}
    </section>
  );
}

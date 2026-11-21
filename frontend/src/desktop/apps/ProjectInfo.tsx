import './project-info.css';

import { projects } from '../../data';
import type { ProjectId } from '../../data';

interface ProjectInfoProps {
  id: ProjectId;
  /** `dark`: auf dunklem Fenster (Steam). `card`: weisse Karte auf farbigem Hintergrund. */
  tone?: 'plain' | 'card' | 'dark';
}

/** «Über das Projekt»: Beschreibung, so funktioniert es, Technik, Repo-Link. Texte aus data/. */
export function ProjectInfo({ id, tone = 'plain' }: ProjectInfoProps) {
  const d = projects.details[id];
  const headingId = `pinfo-${id}`;
  return (
    <section className={`pinfo pinfo--${tone}`} aria-labelledby={headingId}>
      <h3 id={headingId} className="pinfo__title">
        Über das Projekt
      </h3>
      {d.tech.length > 0 && (
        <ul className="pinfo__chips" aria-label="Technologien">
          {d.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      {d.summary.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {d.points.length > 0 && (
        <>
          <h4 className="pinfo__sub">So funktioniert es</h4>
          <ul className="pinfo__points">
            {d.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}
      {d.repo ? (
        <a className="pinfo__repo" href={d.repo.href} target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
          </svg>
          GitHub: {d.repo.label} ↗
        </a>
      ) : (
        d.codeNote && <p className="pinfo__note">{d.codeNote}</p>
      )}
    </section>
  );
}

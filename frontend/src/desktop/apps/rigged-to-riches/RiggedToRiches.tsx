import './RiggedToRiches.css';

import { useStatus } from '../../../api/statusContext';
import { projects } from '../../../data';
import { ProjectInfo } from '../ProjectInfo';

export function RiggedToRiches() {
  const rtr = projects.rtr;
  const { status } = useStatus();
  return (
    <div className="rtr">
      <div className="rtr__trailer">
        <span className="rtr__trailer-label mono">{rtr.trailer}</span>
        <span aria-hidden="true" className="rtr__play">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
            <path d="M7 4l14 8-14 8z" />
          </svg>
        </span>
      </div>
      <div className="rtr__info">
        <h2 className="rtr__title">{rtr.title}</h2>
        <p className="rtr__text">{rtr.description}</p>
        <ul className="rtr__tags" aria-label="Tags">
          {rtr.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="rtr__footer">
          <span className="mono rtr__wishlists">Wishlists: {status.wishlists}</span>
          <a className="rtr__cta" href={rtr.cta.href}>
            {rtr.cta.label}
          </a>
        </div>
      </div>
      <ProjectInfo id="rtr" tone="dark" />
    </div>
  );
}

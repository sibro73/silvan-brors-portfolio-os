import '../pdf-preview.css';
import './Wochenbericht.css';

import { agentsReport as r } from '../../data';

export function Wochenbericht() {
  return (
    <div className="pdf">
      <article className="pdf__page report">
        <div className="report__meta mono">
          <span>{r.meta}</span>
          <span>{r.week}</span>
        </div>
        <h2 className="report__title">{r.title}</h2>
        <p className="report__intro">{r.intro}</p>
        <ul className="report__bars" aria-label="Views pro Kanal">
          {r.channels.map((ch) => (
            <li key={ch.name} className="report__row">
              <span className="report__channel">{ch.name}</span>
              <span className="report__track" aria-hidden="true">
                <span
                  className={ch.highlight ? 'report__bar report__bar--hl' : 'report__bar'}
                  style={{ width: `${ch.barWidth}%` }}
                />
              </span>
              <span className="report__views mono">{ch.views}</span>
            </li>
          ))}
        </ul>
        <p className="report__rec">
          <b>Empfehlung:</b> {r.recommendation}
        </p>
        <p className="report__note mono">{r.note}</p>
      </article>
    </div>
  );
}

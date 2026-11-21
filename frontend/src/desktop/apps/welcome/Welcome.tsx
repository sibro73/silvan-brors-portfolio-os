import './Welcome.css';

import { useStatus } from '../../../api/statusContext';
import { APP_BY_ID, type AppId } from '../../apps.registry';
import { profile, type ProjectId, projects } from '../../../data';
import { AppIcon } from '../../AppIcon';
import type { AppProps } from '../../appTypes';

const isAppId = (id: string): id is AppId => id in APP_BY_ID;

/** Startfenster: macht sofort klar, dass das ein Portfolio ist, und führt zu den Projekten. */
export function Welcome({ openApp }: AppProps) {
  const { status, source } = useStatus();
  const w = profile.welcome;

  const numbers = [
    { label: 'Wishlists', value: status.wishlists },
    { label: 'Clips heute', value: status.clipsHeute },
    { label: 'IPA-Fragen', value: status.ipaFragen },
    { label: 'Letzter Bericht', value: status.letzterBericht },
  ];

  return (
    <div className="welcome">
      <header className="welcome__header">
        <h1 className="welcome__title">{w.title}</h1>
        <p className="welcome__subtitle">{w.subtitle}</p>
      </header>

      <p className="welcome__intro">
        {profile.intro.map((part, i) =>
          part.mark ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>,
        )}
      </p>

      <div role="group" aria-labelledby="welcome-projects">
        <h2 id="welcome-projects" className="welcome__heading">
          Projekte
        </h2>
        <ul className="welcome__cards">
          {projects.cards
            .filter((c) => isAppId(c.app))
            .map((card) => {
              const app = APP_BY_ID[card.app as AppId];
              return (
                <li key={card.app} className="welcome__card">
                  {app.icon && (
                    <AppIcon background={app.icon.background} Glyph={app.icon.Glyph} size={44} />
                  )}
                  <div className="welcome__card-text">
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                    {card.app in projects.details && (
                      <p className="welcome__tech mono">
                        {projects.details[card.app as ProjectId].tech.slice(0, 3).join(' · ')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="welcome__open"
                    aria-label={`${card.title} öffnen`}
                    onClick={() => openApp(card.app as AppId)}
                  >
                    Öffnen
                  </button>
                </li>
              );
            })}
        </ul>
      </div>

      <div role="group" aria-label="Live-Zahlen" className="welcome__live">
        <span
          className={source === 'live' ? 'status-dot status-dot--on' : 'status-dot'}
          aria-hidden="true"
        />
        <dl className="welcome__numbers">
          {numbers.map((n) => (
            <div key={n.label}>
              <dt>{n.label}</dt>
              <dd>{n.value}</dd>
            </div>
          ))}
        </dl>
        <span className="welcome__source">
          {source === 'live' ? 'live aus /api/status' : 'gespeicherte Daten'}
        </span>
      </div>

      <div className="welcome__actions">
        <button
          type="button"
          className="welcome__btn welcome__btn--primary"
          onClick={() => openApp('cv')}
        >
          Lebenslauf
        </button>
        <button type="button" className="welcome__btn" onClick={() => openApp('kontakt')}>
          Kontakt
        </button>
        <a className="welcome__btn" href="#klassisch">
          Klassische Ansicht
        </a>
      </div>

      <p className="welcome__hint">{w.hint}</p>
    </div>
  );
}

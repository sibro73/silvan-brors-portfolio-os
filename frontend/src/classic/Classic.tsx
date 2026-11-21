import './Classic.css';

import { useEffect, useRef } from 'react';

import { useStatus } from '../api/statusContext';
import { agentsReport, ipa, profile, type ProjectId, projects } from '../data';

/**
 * «Klassische Ansicht»: alle Inhalte auf einer schlichten, linearen Seite.
 * Gleiche Daten wie der Desktop, ohne Fenster, Drag oder Animationen.
 */
/** Beschreibung, Technik und Repo-Link eines Projekts (gleiche Texte wie Desktop und Handy). */
function Details({ id }: { id: ProjectId }) {
  const d = projects.details[id];
  return (
    <>
      {d.summary.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {d.points.length > 0 && (
        <ul>
          {d.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {d.tech.length > 0 && <p className="classic__muted">{d.tech.join(' · ')}</p>}
      {d.repo ? (
        <p>
          <a href={d.repo.href} target="_blank" rel="noopener noreferrer">
            GitHub: {d.repo.label} ↗
          </a>
        </p>
      ) : (
        d.codeNote && <p className="classic__muted">{d.codeNote}</p>
      )}
    </>
  );
}

export function Classic() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { status } = useStatus();
  const { rtr, wetter, shop } = projects;
  const c = profile.contact;

  // Nach dem Wechsel den Fokus an den Seitenanfang setzen (Screenreader, Tastatur).
  useEffect(() => {
    window.scrollTo?.(0, 0);
    headingRef.current?.focus();
  }, []);

  return (
    <div className="classic">
      <header className="classic__header">
        <a className="classic__back" href="#desktop">
          ← Zur Desktop-Ansicht
        </a>
        <h1 ref={headingRef} tabIndex={-1}>
          {profile.name}
        </h1>
        <p className="classic__muted">{profile.tagline}</p>
      </header>

      <main>
        <section aria-labelledby="c-about">
          <h2 id="c-about">Über mich</h2>
          <p>
            {profile.intro.map((part, i) =>
              part.mark ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>,
            )}
          </p>
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="classic__skills">
            {profile.skills.map((s) => (
              <li key={s.area}>
                <b>{s.area}</b> {s.items}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="c-projects">
          <h2 id="c-projects">Projekte</h2>

          <article>
            <h3>{rtr.title}</h3>
            <Details id="rtr" />
            <p className="classic__muted">
              {rtr.tags.join(' · ')} · Wishlists: {status.wishlists}
            </p>
            <p>
              <a href={rtr.cta.href}>{rtr.cta.label}</a>
            </p>
          </article>

          <article>
            <h3>Clipper</h3>
            <Details id="clipper" />
          </article>

          <article>
            <h3>IPA-Assistent</h3>
            <Details id="ipa" />
            <p>{ipa.greeting}</p>
            <dl className="classic__qa">
              {ipa.examples.map((ex) => (
                <div key={ex.question}>
                  <dt>{ex.question}</dt>
                  <dd>
                    {ex.answer} <span className="classic__muted">(Quelle: {ex.source})</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="classic__muted">
              {ipa.footer} · {ipa.exampleNote}
            </p>
          </article>

          <article>
            <h3>Marketing-Agents</h3>
            <Details id="agents" />
            <p>{agentsReport.intro}</p>
            <p>
              <b>Empfehlung:</b> {agentsReport.recommendation}
            </p>
          </article>

          <article>
            <h3>{wetter.title} (BMA)</h3>
            <Details id="wetter" />
          </article>

          <article>
            <h3>{shop.title}</h3>
            <Details id="shop" />
          </article>
        </section>

        <section aria-labelledby="c-cv">
          <h2 id="c-cv">Lebenslauf</h2>
          <p>
            <a href={profile.cv.downloadHref}>{profile.cv.downloadLabel}</a>
          </p>
        </section>

        <section aria-labelledby="c-contact">
          <h2 id="c-contact">Kontakt</h2>
          <p>{c.text}</p>
          <ul className="classic__links">
            <li>
              <a href={`mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`}>{c.email}</a>
            </li>
            {c.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

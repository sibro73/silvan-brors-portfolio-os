import '@fontsource/space-grotesk/latin-700.css';
import './classic.css';

import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { classic, profile } from '../shared/content';
import { HOME_PATH } from '../shared/route';
import { RouteLink } from '../shared/RouteLink';

const TITLE = 'Silvan Brors – Portfolio';
const DESCRIPTION =
  'Portfolio von Silvan Brors, Applikationsentwickler EFZ in Ausbildung bei ti&m in Zürich: Projekte, Werdegang, Skills und Kontakt.';
const COPIED_MS = 1800;
const TOAST_MS = 2200;

const SECTIONS = [
  { id: 'projekte', label: 'Projekte' },
  { id: 'werdegang', label: 'Werdegang' },
  { id: 'skills', label: 'Skills' },
  { id: 'kontakt', label: 'Kontakt' },
] as const;

const reduceMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Weich zum Abschnitt scrollen, ohne die Adresse zu ändern (die Seite bleibt /klassisch). */
function scrollToSection(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView?.({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  el.focus?.({ preventScroll: true });
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l9 10-9 10-9-10z" fill="#5B3CC4" />
    </svg>
  );
}

/** Klassische Ansicht: eine normale Portfolio-Seite unter /klassisch, für alle Geräte. */
export default function ClassicPage() {
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { hero } = classic;
  const email = profile.contact.email;
  const links = profile.contact.links;
  const projects = classic.projects.filter((p) => filter === 'all' || p.filters.includes(filter));

  // Titel und Beschreibung für diese Seite, beim Verlassen wieder wie vorher
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const before = { title: document.title, description: meta?.content };
    document.title = TITLE;
    if (meta) meta.content = DESCRIPTION;
    return () => {
      document.title = before.title;
      if (meta && before.description !== undefined) meta.content = before.description;
    };
  }, []);

  useEffect(
    () => () => {
      clearTimeout(copiedTimer.current);
      clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (text: string) => {
    clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      showToast('Kopieren nicht möglich');
    }
  };

  return (
    <div className="c">
      <header className="c-header">
        <div className="c-wrap c-header__inner">
          <RouteLink to={HOME_PATH} className="c-brand" aria-label="Silvan Brors, Silvan OS öffnen">
            <Logo />
            <span>Silvan Brors</span>
          </RouteLink>
          <nav aria-label="Abschnitte" className="c-nav">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={(e) => scrollToSection(e, s.id)}>
                {s.label}
              </a>
            ))}
            <RouteLink to={HOME_PATH} className="c-btn c-btn--dark">
              Silvan OS öffnen ↗
            </RouteLink>
          </nav>
        </div>
      </header>

      <main>
        <section className="c-hero" aria-labelledby="c-title">
          <div className="c-wrap c-hero__inner">
            <div className="c-hero__text">
              <p className="c-pill c-rise">
                <span className="c-pill__dot" aria-hidden="true" />
                {hero.badge}
              </p>
              <h1 id="c-title" className="c-hero__title c-rise c-rise--1">
                {hero.title}
              </h1>
              <p className="c-hero__lead c-rise c-rise--2">{hero.text}</p>
              <div className="c-hero__actions c-rise c-rise--3">
                <a
                  href="#projekte"
                  className="c-btn c-btn--accent"
                  onClick={(e) => scrollToSection(e, 'projekte')}
                >
                  Projekte ansehen
                </a>
                <a
                  href={profile.cv.downloadHref}
                  className="c-btn c-btn--light"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lebenslauf (PDF)
                </a>
              </div>
            </div>

            <div
              className="c-term c-rise c-rise--2"
              aria-label="Terminal mit Kurzprofil"
              role="img"
            >
              <div className="c-term__bar" aria-hidden="true">
                <span className="c-term__dot c-term__dot--red" />
                <span className="c-term__dot c-term__dot--yellow" />
                <span className="c-term__dot c-term__dot--green" />
                <span className="c-term__title">silvan — zsh</span>
              </div>
              <div className="c-term__body" aria-hidden="true">
                {hero.terminal.map((block) => (
                  <div key={block.cmd}>
                    <div>
                      <span className="c-term__prompt">~ %</span> {block.cmd}
                    </div>
                    {block.out.map((line) => (
                      <div
                        key={line.text}
                        className={line.tone ? `c-term__${line.tone}` : undefined}
                      >
                        {line.text}
                      </div>
                    ))}
                  </div>
                ))}
                <div>
                  <span className="c-term__prompt">~ %</span> <span className="c-term__cursor" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projekte" className="c-section" tabIndex={-1} aria-labelledby="c-projects">
          <div className="c-wrap">
            <div className="c-section__head">
              <div>
                <p className="c-kicker">01 / Projekte</p>
                <h2 id="c-projects">Woran ich arbeite</h2>
              </div>
              <div className="c-filters" role="group" aria-label="Projekte filtern">
                {classic.filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="c-chip"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <ul className="c-grid" aria-label="Projekte">
              {projects.map((p) => (
                <li key={`${filter}-${p.name}`} className="c-card">
                  <div className="c-card__media" style={{ background: p.color }}>
                    {p.image ? (
                      <img
                        className="c-card__img"
                        src={p.image.src}
                        alt={p.image.alt}
                        loading="lazy"
                        decoding="async"
                        width={1280}
                        height={720}
                      />
                    ) : (
                      <span className="c-card__shot">[Screenshot]</span>
                    )}
                    {p.status && <span className="c-card__status">{p.status}</span>}
                  </div>
                  <div className="c-card__body">
                    <p className="c-card__kind">{p.kind}</p>
                    <h3 className="c-card__name">{p.name}</h3>
                    <p className="c-card__text">{p.text}</p>
                    <ul className="c-tags" aria-label="Technologien">
                      {p.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    {p.repo && (
                      <a
                        className="c-card__repo"
                        href={p.repo.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name} auf GitHub`}
                      >
                        {p.repo.label} ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="c-wrap c-split">
          <section
            id="werdegang"
            className="c-section c-split__col"
            tabIndex={-1}
            aria-labelledby="c-cv"
          >
            <p className="c-kicker">02 / Werdegang</p>
            <h2 id="c-cv">Wo ich stehe</h2>
            <ol className="c-timeline">
              {classic.timeline.map((t) => (
                <li key={t.title}>
                  <span className="c-timeline__when">{t.when}</span>
                  <div>
                    <p className="c-timeline__title">{t.title}</p>
                    <p className="c-timeline__text">{t.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            id="skills"
            className="c-section c-split__col"
            tabIndex={-1}
            aria-labelledby="c-skills"
          >
            <p className="c-kicker">03 / Skills</p>
            <h2 id="c-skills">Womit ich arbeite</h2>
            <div className="c-skills">
              {classic.skills.map((g) => (
                <div key={g.label} className="c-skills__group">
                  <p className="c-skills__label">{g.label}</p>
                  <ul className="c-skills__chips">
                    {g.items.map((item) => (
                      <li key={item} style={{ background: g.bg, color: g.fg }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="c-skills__langs">
                <span className="c-skills__label">Sprachen</span>
                {classic.languages}
              </p>
            </div>
          </section>
        </div>

        <section id="kontakt" className="c-contact" tabIndex={-1} aria-labelledby="c-contact">
          <div className="c-wrap c-contact__inner">
            <div className="c-contact__text">
              <p className="c-kicker c-kicker--light">04 / Kontakt</p>
              <h2 id="c-contact">{classic.contactTitle}</h2>
              <p className="c-contact__mail">
                <a href={`mailto:${email}?subject=${encodeURIComponent(profile.contact.subject)}`}>
                  {email}
                </a>
              </p>
            </div>
            <div className="c-contact__actions">
              <button
                type="button"
                className="c-btn c-btn--yellow"
                onClick={copyEmail}
                aria-live="polite"
              >
                {copied ? 'Kopiert' : 'E-Mail kopieren'}
              </button>
              {links.map((l) => (
                <a
                  key={l.label}
                  className="c-btn c-btn--outline"
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="c-footer">
        <div className="c-wrap c-footer__inner">
          <span>© 2026 Silvan Brors · Zürich</span>
          <RouteLink to={HOME_PATH}>Silvan OS</RouteLink>
        </div>
      </footer>

      {toast && (
        <div role="status" className="c-toast">
          {toast}
        </div>
      )}
    </div>
  );
}

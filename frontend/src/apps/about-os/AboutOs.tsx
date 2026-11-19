import './AboutOs.css';

const STACK: { area: string; items: string }[] = [
  { area: 'Frontend', items: 'React, TypeScript, Vite' },
  { area: 'Backend', items: 'Spring Boot, Java 21' },
  { area: 'Betrieb', items: 'Docker, GitHub Actions' },
];

export function AboutOs() {
  return (
    <div className="about-os">
      <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true" className="about-os__logo">
        <path d="M12 2l9 10-9 10-9-10z" fill="currentColor" />
      </svg>
      <h2 className="about-os__title">Silvan OS</h2>
      <p className="about-os__version">Version {__APP_VERSION__}</p>
      <p className="about-os__text">Das Portfolio von Silvan Brors als Desktop im Browser.</p>
      <dl className="about-os__stack">
        {STACK.map((s) => (
          <div key={s.area}>
            <dt>{s.area}</dt>
            <dd>{s.items}</dd>
          </div>
        ))}
      </dl>
      {/* Repo ist privat: Link folgt, sobald es öffentlich ist. */}
      <p className="about-os__muted">Quellcode: [GitHub-Repo]</p>
    </div>
  );
}

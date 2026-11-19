import './MenuBar.css';

import { useClock } from './useClock';

const MENUS = ['Ablage', 'Bearbeiten', 'Darstellung', 'Fenster', 'Hilfe'];

interface MenuBarProps {
  activeName: string;
}

export function MenuBar({ activeName }: MenuBarProps) {
  const clock = useClock();
  const splitAt = clock.lastIndexOf(' ');
  const date = clock.slice(0, splitAt + 1);
  const time = clock.slice(splitAt + 1);

  return (
    <header className="menubar">
      <div className="menubar__left">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l9 10-9 10-9-10z" fill="currentColor" />
        </svg>
        <span className="menubar__app" data-testid="active-app">
          {activeName}
        </span>
        {MENUS.map((m) => (
          <span key={m} className="menubar__menu">
            {m}
          </span>
        ))}
      </div>
      <div className="menubar__right">
        <a className="menubar__link" href="#klassisch">
          Klassische Ansicht
        </a>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="menubar__wifi"
          role="img"
          aria-label="WLAN verbunden"
        >
          <path d="M2 8.5a15 15 0 0 1 20 0" />
          <path d="M5.5 12a10 10 0 0 1 13 0" />
          <path d="M9 15.5a5 5 0 0 1 6 0" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
        </svg>
        <span className="menubar__battery">
          100 %
          <svg width="24" height="14" viewBox="0 0 26 14" aria-hidden="true">
            <rect
              x="0.75"
              y="0.75"
              width="21.5"
              height="12.5"
              rx="3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <rect x="2.5" y="2.5" width="16" height="9" rx="2" fill="currentColor" />
            <rect
              x="23.2"
              y="4.5"
              width="1.8"
              height="5"
              rx="0.9"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </span>
        <time className="menubar__clock">
          <span className="menubar__date">{date}</span>
          {time}
        </time>
      </div>
    </header>
  );
}

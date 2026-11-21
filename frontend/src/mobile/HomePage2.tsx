import type { MouseEvent } from 'react';

import { useAgentsReport } from '../api/agentsReport';
import { useStatus } from '../api/statusContext';
import { formatWhen, upcomingEvents, zurichToday } from '../shared/calendar';
import { events, profile } from '../shared/content';
import type { OpenHandler } from './HomeScreen';
import type { MobileAppId } from './mobileApps';

const linkedin = profile.contact.links.find((l) => l.label === 'LinkedIn');

/** Zweite Seite des Home-Bildschirms: Live-Zahlen, nächster Termin, Wochenbericht, Links. */
export function HomePage2({ onOpen }: { onOpen: OpenHandler }) {
  const { status, source } = useStatus();
  const report = useAgentsReport();
  const next = upcomingEvents(events, zurichToday())[0];
  const open = (id: MobileAppId) => (e: MouseEvent<HTMLButtonElement>) =>
    onOpen(id, e.currentTarget);
  const stats: [string, string | number][] = [
    ['Wishlists', status.wishlists],
    ['Clips heute', status.clipsHeute],
    ['IPA-Fragen', status.ipaFragen],
    ['Letzter Bericht', status.letzterBericht],
  ];

  return (
    <>
      {/* Widget: Live-Zahlen (4×2) */}
      <div className="m-widget m-widget--wide">
        <button
          type="button"
          className="m-widget__card m-widget__card--glass m-ic"
          onClick={open('terminal')}
          aria-label={`Live-Zahlen: ${stats.map(([k, v]) => `${k} ${v}`).join(', ')}. Terminal öffnen`}
        >
          <span className="m-stat">
            {stats.map(([label, value]) => (
              <span key={label}>
                <span className="m-stat__label">{label}</span>
                <span className="m-stat__value">{value}</span>
              </span>
            ))}
          </span>
          <span className="m-stat__source">
            <span
              className={source === 'live' ? 'm-pulse' : undefined}
              style={
                source === 'live'
                  ? undefined
                  : {
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.5)',
                    }
              }
              aria-hidden="true"
            />
            {source === 'live' ? 'live aus /api/status' : 'gespeicherte Daten'}
          </span>
        </button>
        <span className="m-lbl" aria-hidden="true">
          Live-Zahlen
        </span>
      </div>

      {/* Widget: nächster Termin (2×2) */}
      <div className="m-widget m-widget--half">
        <button
          type="button"
          className="m-widget__card m-widget__card--event m-ic"
          onClick={open('kalender')}
        >
          <span
            style={{ fontSize: 12, fontWeight: 600, color: '#D70015', textTransform: 'uppercase' }}
          >
            Demnächst
          </span>
          {next ? (
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{next.title}</span>
              <span style={{ fontSize: 12, color: '#6E6E73' }}>{formatWhen(next.when)}</span>
            </span>
          ) : (
            <span style={{ fontSize: 13, color: '#6E6E73' }}>Keine Termine</span>
          )}
        </button>
        <span className="m-lbl" aria-hidden="true">
          Kalender
        </span>
      </div>

      {/* Widget: Wochenbericht (2×2) */}
      <div className="m-widget m-widget--half">
        <button
          type="button"
          className="m-widget__card m-widget__card--report m-ic"
          onClick={open('agents')}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Wochenbericht</span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }} aria-hidden="true">
            {report.channels.slice(0, 3).map((ch, i) => (
              <span key={ch.name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{ch.name}</span>
                  <span style={{ opacity: 0.85 }}>{ch.views}</span>
                </span>
                <span style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)' }}>
                  <span
                    className="m-mini-bar"
                    style={{
                      display: 'block',
                      width: `${ch.barWidth}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </span>
              </span>
            ))}
          </span>
        </button>
        <span className="m-lbl" aria-hidden="true">
          Agents
        </span>
      </div>

      {/* Startseite als App */}
      <button type="button" className="m-app m-ic" onClick={open('welcome')}>
        <span
          className="m-app__tile"
          style={{ background: 'linear-gradient(160deg, #8466F0, #4A2FB0)' }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5l7.5 8.5-7.5 8.5-7.5-8.5z" fill="#FFFFFF" />
          </svg>
        </span>
        <span className="m-lbl">Willkommen</span>
      </button>

      {/* Links */}
      {linkedin && (
        <a
          className="m-app m-ic"
          href={linkedin.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn (öffnet in neuem Tab)"
          style={{ textDecoration: 'none' }}
        >
          <span
            className="m-app__tile"
            style={{ background: 'linear-gradient(160deg, #2D8CFF, #0A5CC2)' }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="#FFFFFF">
              <path d="M6.5 9.5h-3v10h3v-10zM5 4.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5zM20.5 13.6c0-2.9-1.6-4.3-3.7-4.3-1.7 0-2.5.9-2.9 1.6V9.5h-3v10h3v-5.4c0-1.4.3-2.7 2-2.7s1.7 1.6 1.7 2.8v5.3h3v-5.9z" />
            </svg>
          </span>
          <span className="m-lbl">LinkedIn</span>
        </a>
      )}
      <a
        className="m-app m-ic"
        href="#klassisch"
        aria-label="Klassische Ansicht"
        style={{ textDecoration: 'none' }}
      >
        <span
          className="m-app__tile"
          style={{ background: 'linear-gradient(160deg, #F5F5F7, #C9CAD3)' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1D1D1F"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M5 5h14M5 9.5h14M5 14h9M5 18.5h11" />
          </svg>
        </span>
        <span className="m-lbl">Klassisch</span>
      </a>
    </>
  );
}

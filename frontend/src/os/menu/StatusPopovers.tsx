import { useStatus } from '../../api/statusContext';
import { events } from '../../data';
import { APPRENTICESHIP } from '../../data/apprenticeship';
import { formatWhen, MONTHS, monthGrid, upcomingEvents, WEEKDAYS, zurichToday } from './calendar';

export function WifiIcon({ offline = false }: { offline?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      opacity={offline ? 0.45 : 1}
    >
      <path d="M2 8.5a15 15 0 0 1 20 0" />
      <path d="M5.5 12a10 10 0 0 1 13 0" />
      <path d="M9 15.5a5 5 0 0 1 6 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

export function BatteryIcon() {
  return (
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
      <rect x="23.2" y="4.5" width="1.8" height="5" rx="0.9" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** Backend-Status: online mit Antwortzeit oder Offline-Modus. */
export function WifiPanel() {
  const { source, latencyMs, loading, refresh } = useStatus();
  let text: string;
  if (loading) text = 'Prüfe Verbindung …';
  else if (source === 'live') text = `Backend online · Antwortzeit ${latencyMs ?? '–'} ms`;
  else text = 'Offline-Modus, zeige gespeicherte Daten';

  return (
    <div className="popover__body">
      <p className="popover__title">Backend</p>
      <p className="popover__row">
        <span
          className={source === 'live' ? 'status-dot status-dot--on' : 'status-dot'}
          aria-hidden="true"
        />
        <span aria-live="polite">{text}</span>
      </p>
      <p className="popover__muted mono">GET /api/status</p>
      <button
        type="button"
        className="popover__button"
        disabled={loading}
        onClick={() => void refresh()}
      >
        Erneut prüfen
      </button>
    </div>
  );
}

/** Fortschritt der Lehre. Ohne bekannten Wert bleibt der Platzhalter «[x]». */
export function BatteryPanel() {
  const { year, totalYears } = APPRENTICESHIP;
  const label = `Lehrjahr ${year ?? '[x]'} von ${totalYears}`;
  const percent = year === null ? 0 : Math.round((year / totalYears) * 100);
  return (
    <div className="popover__body">
      <p className="popover__title">Lehre Applikationsentwickler EFZ</p>
      <p className="popover__row">{label}</p>
      <div
        className="progress"
        role="progressbar"
        aria-label="Fortschritt der Lehre"
        aria-valuemin={0}
        aria-valuemax={totalYears}
        aria-valuenow={year ?? undefined}
        aria-valuetext={label}
      >
        <span className="progress__bar" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** Kalender des aktuellen Monats (Zürich) und kommende Termine aus data/events.json. */
export function CalendarPanel({ now }: { now?: Date }) {
  const today = zurichToday(now);
  const weeks = monthGrid(today.year, today.month);
  const upcoming = upcomingEvents(events, today);
  const caption = `${MONTHS[today.month - 1]} ${today.year}`;

  return (
    <div className="popover__body">
      <table className="calendar">
        <caption className="popover__title">{caption}</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" abbr={d}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => (
                <td
                  key={j}
                  className={day === today.day ? 'calendar__today' : undefined}
                  aria-current={day === today.day ? 'date' : undefined}
                >
                  {day ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="popover__title popover__title--spaced">Kommende Termine</p>
      {upcoming.length === 0 ? (
        <p className="popover__muted">Keine Termine.</p>
      ) : (
        <ul className="events">
          {upcoming.map((e) => (
            <li key={e.title + e.when}>
              <span className="events__when">{formatWhen(e.when)}</span>
              <span className="events__title">{e.title}</span>
              {e.detail && <span className="popover__muted">{e.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

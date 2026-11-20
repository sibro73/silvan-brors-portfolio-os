import {
  formatWhen,
  MONTHS,
  monthGrid,
  upcomingEvents,
  WEEKDAYS,
  zurichToday,
} from '../../shared/calendar';
import { events } from '../../shared/content';

const EVENT_COLORS = ['#B3122B', '#2F6FE4'];

export function Kalender() {
  const today = zurichToday();
  const days = monthGrid(today.year, today.month).flat();
  const upcoming = upcomingEvents(events, today);
  return (
    <div className="m-stack m-stack--16">
      <h2 className="m-h2" style={{ color: '#D70015', letterSpacing: 0 }}>
        {MONTHS[today.month - 1]} {today.year}
      </h2>
      <div
        aria-hidden="true"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          textAlign: 'center',
          fontSize: 12,
          color: '#6E6E73',
        }}
      >
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div
        role="grid"
        aria-label={`${MONTHS[today.month - 1]} ${today.year}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          rowGap: 8,
          justifyItems: 'center',
        }}
      >
        {days.map((d, i) => {
          const isToday = d === today.day;
          return (
            <span
              key={i}
              aria-current={isToday ? 'date' : undefined}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isToday ? '#D70015' : 'transparent',
                color: isToday ? '#FFFFFF' : '#1D1D1F',
                fontWeight: isToday ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
              }}
            >
              {d ?? ''}
            </span>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="m-group-label" style={{ fontWeight: 600 }}>
          Demnächst
        </span>
        <div className="m-list">
          {upcoming.map((e, i) => (
            <div
              key={e.title}
              className="m-list__row"
              style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
            >
              <span
                style={{
                  width: 4,
                  borderRadius: 2,
                  background: EVENT_COLORS[i % EVENT_COLORS.length],
                }}
              />
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <b style={{ fontSize: 15, fontWeight: 600 }}>{e.title}</b>
                <span style={{ fontSize: 13, color: '#6E6E73' }}>
                  {e.detail ? `${e.detail} · ` : ''}
                  {formatWhen(e.when)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

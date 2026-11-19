import { describe, expect, it } from 'vitest';

import { formatWhen, monthGrid, parseWhen, upcomingEvents, zurichToday } from './calendar';

describe('calendar', () => {
  it('uses the Zurich date, not the browser time zone', () => {
    // 23:30 UTC am 30.11. ist in Zürich schon der 1.12.
    expect(zurichToday(new Date('2026-11-30T23:30:00Z'))).toEqual({
      year: 2026,
      month: 12,
      day: 1,
    });
  });

  it('builds a Monday-first month grid', () => {
    const weeks = monthGrid(2026, 11); // 1.11.2026 ist ein Sonntag
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it('formats dates only as precisely as known', () => {
    expect(formatWhen('2027')).toBe('2027');
    expect(formatWhen('2027-02')).toBe('Februar 2027');
    expect(formatWhen('2027-02-15')).toBe('15. Februar 2027');
    expect(parseWhen('Februar')).toBeNull();
  });

  it('lists upcoming events in order and drops past ones', () => {
    const events = [
      { title: 'Lehrabschluss', when: '2027' },
      { title: 'Next Fest', when: '2027-02' },
      { title: 'Vorbei', when: '2026-10' },
    ];
    expect(upcomingEvents(events, { year: 2026, month: 11, day: 19 }).map((e) => e.title)).toEqual([
      'Next Fest',
      'Lehrabschluss',
    ]);
    // ein Monat zählt bis zum letzten Tag
    expect(upcomingEvents(events, { year: 2027, month: 2, day: 28 }).map((e) => e.title)).toEqual([
      'Next Fest',
      'Lehrabschluss',
    ]);
  });
});

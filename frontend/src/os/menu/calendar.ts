import type { CalendarEvent } from '../../data';
import { TIME_ZONE } from '../clock';

export interface DateParts {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

export const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];
export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/** Heutiges Datum in Zürich (nicht in der Zeitzone des Browsers). */
export function zurichToday(now: Date = new Date()): DateParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Wochen des Monats, Montag zuerst. `null` = Tag aus dem Nachbarmonat. */
export function monthGrid(year: number, month: number): (number | null)[][] {
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // Mo = 0
  const total = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "2027" | "2027-02" | "2027-02-15" → Teile; nur so genau wie angegeben. */
export function parseWhen(when: string): { year: number; month?: number; day?: number } | null {
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(when);
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: m[2] ? Number(m[2]) : undefined,
    day: m[3] ? Number(m[3]) : undefined,
  };
}

export function formatWhen(when: string): string {
  const p = parseWhen(when);
  if (!p) return when;
  if (p.month && p.day) return `${p.day}. ${MONTHS[p.month - 1]} ${p.year}`;
  if (p.month) return `${MONTHS[p.month - 1]} ${p.year}`;
  return String(p.year);
}

/** Letzter Tag, den ein (ungenaues) Datum abdeckt, als vergleichbare Zahl JJJJMMTT. */
function endKey(when: string): number | null {
  const p = parseWhen(when);
  if (!p) return null;
  const month = p.month ?? 12;
  const day = p.day ?? daysInMonth(p.year, month);
  return p.year * 10000 + month * 100 + day;
}

/** Termine, die noch nicht vorbei sind, nach Datum sortiert. */
export function upcomingEvents(events: CalendarEvent[], today: DateParts): CalendarEvent[] {
  const todayKey = today.year * 10000 + today.month * 100 + today.day;
  return events
    .filter((e) => (endKey(e.when) ?? 0) >= todayKey)
    .sort((a, b) => (endKey(a.when) ?? 0) - (endKey(b.when) ?? 0));
}

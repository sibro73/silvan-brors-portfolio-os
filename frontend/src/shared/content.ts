/**
 * Gemeinsame Inhalte für Desktop- und Handy-Ansicht. Die Texte selbst liegen in `data/*.json`
 * und werden nur dort gepflegt. Hier kommen sie zusammen, dazu was beide Ansichten gleich zeigen.
 */
export {
  agentsReport,
  type AgentsReport,
  type CalendarEvent,
  events,
  ipa,
  profile,
  projects,
  status,
  type Status,
} from '../data';
export { APPRENTICESHIP } from '../data/apprenticeship';
export { WALLPAPERS, type WallpaperId } from './wallpaper';

/** Technik hinter Silvan OS («Über Silvan OS» am Desktop, «Einstellungen» am Handy). */
export const OS_STACK: { area: string; items: string }[] = [
  { area: 'Frontend', items: 'React, TypeScript, Vite' },
  { area: 'Backend', items: 'Spring Boot 4, Java 21' },
  { area: 'Datenbank', items: 'Postgres' },
  { area: 'Betrieb', items: 'Docker, GitHub Actions' },
];

/** Hosting bleibt Platzhalter, bis es feststeht. */
export const OS_HOSTING = '[Hosting]';

/** Beispielfragen der Terminal-Chips am Handy. */
export const TERMINAL_CHIPS = ['help', 'whoami', 'skills', 'projekte', 'motto', 'open rtr'];

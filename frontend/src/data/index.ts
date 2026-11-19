/**
 * Statische Fallback-Daten. Solange das Backend fehlt (oder nicht antwortet),
 * zeigt die Seite diese Inhalte. Werte in eckigen Klammern sind Platzhalter
 * und bleiben stehen, bis echte Daten da sind.
 */
import agentsReportJson from './agents-report.json';
import eventsJson from './events.json';
import ipaJson from './ipa.json';
import profileJson from './profile.json';
import projectsJson from './projects.json';
import statusJson from './status.json';

export interface Link {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  greeting: string;
  tagline: string;
  /** Einleitung, Teile mit `mark` werden hervorgehoben. */
  intro: { text: string; mark?: boolean }[];
  tip: string;
  skills: { area: string; items: string }[];
  motto: string[];
  contact: { email: string; subject: string; text: string; links: Link[] };
  cv: { role: string; placeholder: string; downloadLabel: string; downloadHref: string };
}

export interface Projects {
  rtr: {
    title: string;
    trailer: string;
    description: string;
    tags: string[];
    cta: Link;
  };
  clipper: {
    botName: string;
    botInitials: string;
    botTag: string;
    highlight: { before: string; streamer: string; after: string; time: string };
    clip: { label: string; caption: string };
    reply: { text: string; time: string };
    footer: string;
    notification: string;
  };
  wetter: { title: string; description: string; placeholder: string };
  shop: { title: string; description: string };
}

export interface AgentsReport {
  meta: string;
  week: string;
  title: string;
  intro: string;
  channels: { name: string; barWidth: number; highlight?: boolean; views: string }[];
  recommendation: string;
  note: string;
}

export interface IpaData {
  greeting: string;
  footer: string;
  examples: { question: string; answer: string; source: string }[];
}

/** Gleiche Form wie später `GET /api/status`. */
export interface Status {
  wishlists: string | number;
  clipsHeute: string | number;
  ipaFragen: string | number;
  letzterBericht: string;
}

/**
 * Termin für den Kalender in der Menüleiste.
 * `when`: so genau, wie bekannt: "2027", "2027-02" oder "2027-02-15". Nichts erfinden.
 */
export interface CalendarEvent {
  title: string;
  detail?: string;
  when: string;
}

export const profile: Profile = profileJson;
export const projects: Projects = projectsJson;
export const agentsReport: AgentsReport = agentsReportJson;
export const ipa: IpaData = ipaJson;
export const status: Status = statusJson;
export const events: CalendarEvent[] = eventsJson;

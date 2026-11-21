/**
 * Statische Fallback-Daten. Solange das Backend fehlt (oder nicht antwortet),
 * zeigt die Seite diese Inhalte. Werte in eckigen Klammern sind Platzhalter
 * und bleiben stehen, bis echte Daten da sind.
 */
import agentsReportJson from './agents-report.json';
import classicJson from './classic.json';
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
  /** Weitere Absätze über mich (Über mich.txt, Notizen am Handy). */
  about: string[];
  /** Repo dieser Seite. */
  source: Link;
  tip: string;
  /** Tipp in der Handy-Ansicht (Notizen). */
  tipMobile: string;
  /** Stichworte im Profil-Widget der Handy-Ansicht. */
  tags: string[];
  skills: { area: string; items: string }[];
  motto: string[];
  contact: { email: string; subject: string; text: string; links: Link[] };
  cv: {
    role: string;
    /** Bild der ersten Seite (aus docs/cv/lebenslauf.html), als Vorschau im Fenster. */
    preview: string;
    /** Hochauflösend für die Grossansicht (Zoom bis 300 %). */
    previewLarge: string;
    previewAlt: string;
    downloadLabel: string;
    downloadHref: string;
  };
  welcome: { title: string; subtitle: string; hint: string };
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
    /** Mitteilung in der Handy-Ansicht («Tippe» statt «Klick»). */
    notificationTouch: string;
  };
  wetter: {
    title: string;
    description: string;
    placeholder: string;
    /** Handy-Ansicht: Zeile im Widget und Untertitel in der App. */
    widget: string;
    subtitle: string;
    temperature: string;
  };
  shop: { title: string; description: string; tags: string[] };
  /** Projektkarten im Willkommensfenster. `app` = AppId aus apps.registry.ts. */
  cards: { app: string; title: string; text: string }[];
  /** «Über das Projekt» in jedem Projekt-Fenster, Desktop und Handy. */
  details: Record<ProjectId, ProjectDetails>;
}

export type ProjectId = 'rtr' | 'clipper' | 'ipa' | 'agents' | 'wetter' | 'shop';

export interface ProjectDetails {
  /** Absätze: was das Projekt ist und warum. */
  summary: string[];
  /** «So funktioniert es». */
  points: string[];
  tech: string[];
  /** Öffentliches Repo. Fehlt es, steht `codeNote` da. */
  repo?: Link;
  codeNote?: string;
}

export interface AgentsReport {
  meta: string;
  week: string;
  title: string;
  intro: string;
  channels: { name: string; barWidth: number; highlight?: boolean; views: string }[];
  recommendation: string;
  note?: string;
}

export interface IpaData {
  greeting: string;
  /** Begrüssung auf der Live-Seite (RAG über die Notizen auf Cloudflare). */
  agentGreeting: string;
  footer: string;
  /** Hinweis in der Fusszeile, wenn der Chat nur Beispiele zeigt. */
  exampleNote: string;
  /** Fusszeile auf der Live-Seite. */
  agentFooter: string;
  inputLabel: string;
  placeholder: string;
  thinking: string;
  exampleLabel: string;
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

/** Klassische Ansicht unter /klassisch: eine normale Portfolio-Seite. */
export interface ClassicData {
  hero: {
    badge: string;
    title: string;
    text: string;
    terminal: { cmd: string; out: { text: string; tone?: 'muted' | 'yellow' }[] }[];
  };
  filters: { id: string; label: string }[];
  projects: {
    name: string;
    /** Art, z. B. «AI, Automatisierung». */
    kind: string;
    /** Filter-Kategorien (ids aus `filters`). */
    filters: string[];
    /** Farbe der Bildfläche auf der Karte. */
    color: string;
    status?: string;
    text: string;
    tags: string[];
    repo?: Link;
  }[];
  timeline: { when: string; title: string; text: string }[];
  skills: { label: string; items: string[]; bg: string; fg: string }[];
  languages: string;
  contactTitle: string;
}

export const classic: ClassicData = classicJson as ClassicData;

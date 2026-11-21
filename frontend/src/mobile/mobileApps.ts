/** Apps der Handy-Ansicht: Titel und Farben der geöffneten App aus design/mobile.dc.html. */
export type MobileAppId =
  | 'rtr'
  | 'clipper'
  | 'ipa'
  | 'agents'
  | 'wetter'
  | 'shop'
  | 'cv'
  | 'kalender'
  | 'settings'
  | 'kontakt'
  | 'notes'
  | 'terminal'
  | 'welcome';

export interface MobileAppStyle {
  title: string;
  bg: string;
  fg: string;
  tint: string;
}

export const MOBILE_APPS: Record<MobileAppId, MobileAppStyle> = {
  rtr: {
    title: 'Rigged to Riches',
    bg: 'linear-gradient(180deg, #2A0710 0%, #12060A 60%)',
    fg: '#FFFFFF',
    tint: '#F2C14E',
  },
  clipper: { title: 'Telegram', bg: '#D4E7F5', fg: '#1D1D1F', tint: '#1A73B5' },
  ipa: { title: 'IPA-Assistent', bg: '#FFFFFF', fg: '#1D1D1F', tint: '#5B3CC4' },
  agents: { title: 'Wochenbericht', bg: '#F2F2F7', fg: '#1D1D1F', tint: '#C2570C' },
  wetter: {
    title: 'Wetter',
    bg: 'linear-gradient(180deg, #3F72E6 0%, #5B3CC4 100%)',
    fg: '#FFFFFF',
    tint: '#FFFFFF',
  },
  shop: { title: 'shop-outreach', bg: '#F2F2F7', fg: '#1D1D1F', tint: '#B02A6B' },
  cv: { title: 'Lebenslauf.pdf', bg: '#F2F2F7', fg: '#1D1D1F', tint: '#2F6FE4' },
  kalender: { title: 'Kalender', bg: '#F2F2F7', fg: '#1D1D1F', tint: '#D70015' },
  settings: { title: 'Einstellungen', bg: '#F2F2F7', fg: '#1D1D1F', tint: '#2F6FE4' },
  kontakt: { title: 'Neue E-Mail', bg: '#FFFFFF', fg: '#1D1D1F', tint: '#2F6FE4' },
  notes: { title: 'Notizen', bg: '#FFFDF5', fg: '#1D1D1F', tint: '#B8860B' },
  terminal: { title: 'Terminal', bg: '#1E1E1E', fg: '#FFFFFF', tint: '#7EE787' },
  welcome: { title: 'Willkommen', bg: '#FFFFFF', fg: '#1D1D1F', tint: '#5B3CC4' },
};

/** Namen für `open <name>` im Handy-Terminal. */
export const MOBILE_OPEN_ALIASES: Record<string, MobileAppId> = {
  rtr: 'rtr',
  'rigged-to-riches': 'rtr',
  clipper: 'clipper',
  ipa: 'ipa',
  agents: 'agents',
  kontakt: 'kontakt',
  mail: 'kontakt',
  lebenslauf: 'cv',
  cv: 'cv',
  wetter: 'wetter',
  shop: 'shop',
  kalender: 'kalender',
  willkommen: 'welcome',
  start: 'welcome',
};

/** Was eine App von der Handy-Ansicht bekommt. */
export interface MobileAppProps {
  open: (id: MobileAppId, from?: HTMLElement) => void;
  goHome: () => void;
  toast: (text: string) => void;
}

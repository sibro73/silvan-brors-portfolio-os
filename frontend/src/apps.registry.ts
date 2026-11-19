import type { ComponentType } from 'react';

import { About } from './apps/about/About';
import { Finder } from './apps/finder/Finder';
import { RiggedToRiches } from './apps/rigged-to-riches/RiggedToRiches';
import { Clipper } from './apps/clipper/Clipper';
import { IpaAssistent } from './apps/ipa-assistent/IpaAssistent';
import { Wochenbericht } from './apps/agents/Wochenbericht';
import { Mail } from './apps/mail/Mail';
import { Lebenslauf } from './apps/lebenslauf/Lebenslauf';
import { Terminal } from './apps/terminal/Terminal';
import { Wetter } from './apps/wetter/Wetter';
import { ShopOutreach } from './apps/shop-outreach/ShopOutreach';
import { Glyph as AgentsGlyph } from './apps/agents/Glyph';
import { Glyph as ClipperGlyph } from './apps/clipper/Glyph';
import { Glyph as FinderGlyph } from './apps/finder/Glyph';
import { Glyph as IpaGlyph } from './apps/ipa-assistent/Glyph';
import { Glyph as MailGlyph } from './apps/mail/Glyph';
import { Glyph as RtrGlyph } from './apps/rigged-to-riches/Glyph';
import { Glyph as ShopGlyph } from './apps/shop-outreach/Glyph';
import { Glyph as TerminalGlyph } from './apps/terminal/Glyph';
import { Glyph as WetterGlyph } from './apps/wetter/Glyph';
import type { GlyphProps } from './os/AppIcon';
import type { AppProps } from './os/appTypes';

export type AppId =
  | 'about'
  | 'finder'
  | 'terminal'
  | 'rtr'
  | 'clipper'
  | 'ipa'
  | 'agents'
  | 'kontakt'
  | 'cv'
  | 'wetter'
  | 'shop';

export type DesktopIconKind =
  { kind: 'folder' } | { kind: 'document'; badge: string; badgeColor: string };

export interface AppDefinition {
  id: AppId;
  /** Text in der Titelleiste und aria-label des Fensters. */
  title: string;
  /** Name in der Menüleiste, wenn das Fenster vorne ist. */
  menuName: string;
  /** Standardposition und -grösse auf dem Desktop (px). */
  x: number;
  y: number;
  width: number;
  height: number | 'auto';
  /** Dunkle Titelleiste (Terminal). */
  dark?: boolean;
  icon?: { background: string; Glyph: ComponentType<GlyphProps> };
  /** Beschriftung im Dock (Reihenfolge = Reihenfolge dieser Liste). */
  dock?: string;
  /** Beschriftung im Ordner «Projekte». */
  finder?: string;
  /** Inhalt des Fensters. */
  component: ComponentType<AppProps>;
  /** Icon auf dem Schreibtisch. */
  desktop?: { label: string } & DesktopIconKind;
}

export const APPS: AppDefinition[] = [
  {
    id: 'about',
    component: About,
    title: 'Über mich.txt',
    menuName: 'TextEdit',
    x: 90,
    y: 40,
    width: 500,
    height: 'auto',
    desktop: { label: 'Über mich.txt', kind: 'document', badge: 'TXT', badgeColor: '#8E8E93' },
  },
  {
    id: 'finder',
    component: Finder,
    title: 'Projekte',
    menuName: 'Finder',
    x: 150,
    y: 380,
    width: 600,
    height: 300,
    icon: { background: '#4FA3F7', Glyph: FinderGlyph },
    dock: 'Finder',
    desktop: { label: 'Projekte', kind: 'folder' },
  },
  {
    id: 'terminal',
    component: Terminal,
    title: 'silvan — zsh — 80×24',
    menuName: 'Terminal',
    x: 700,
    y: 90,
    width: 600,
    height: 340,
    dark: true,
    icon: { background: '#1E1E1E', Glyph: TerminalGlyph },
    dock: 'Terminal',
  },
  {
    id: 'rtr',
    component: RiggedToRiches,
    title: 'Rigged to Riches',
    menuName: 'Rigged to Riches',
    x: 240,
    y: 40,
    width: 620,
    height: 'auto',
    icon: { background: '#7A0E1C', Glyph: RtrGlyph },
    dock: 'Rigged to Riches',
    finder: 'Rigged to Riches',
  },
  {
    id: 'clipper',
    component: Clipper,
    title: 'Telegram — Clipper Bot',
    menuName: 'Telegram',
    x: 880,
    y: 30,
    width: 380,
    height: 580,
    icon: { background: '#4B2FB8', Glyph: ClipperGlyph },
    dock: 'Telegram',
    finder: 'Clipper',
  },
  {
    id: 'ipa',
    component: IpaAssistent,
    title: 'IPA-Assistent',
    menuName: 'IPA-Assistent',
    x: 420,
    y: 100,
    width: 540,
    height: 'auto',
    icon: { background: '#2F6FE4', Glyph: IpaGlyph },
    dock: 'IPA-Assistent',
    finder: 'IPA-Assistent',
  },
  {
    id: 'agents',
    component: Wochenbericht,
    title: 'Wochenbericht.pdf',
    menuName: 'Vorschau',
    x: 520,
    y: 40,
    width: 560,
    height: 600,
    icon: { background: '#FF7A1A', Glyph: AgentsGlyph },
    dock: 'Wochenbericht',
    finder: 'Marketing-Agents',
  },
  {
    id: 'kontakt',
    component: Mail,
    title: 'Neue E-Mail',
    menuName: 'Mail',
    x: 560,
    y: 150,
    width: 480,
    height: 'auto',
    icon: { background: '#2E9BF0', Glyph: MailGlyph },
    dock: 'Mail',
    desktop: { label: 'Kontakt', kind: 'document', badge: '@', badgeColor: '#2E9BF0' },
  },
  {
    id: 'cv',
    component: Lebenslauf,
    title: 'Lebenslauf.pdf',
    menuName: 'Vorschau',
    x: 640,
    y: 30,
    width: 460,
    height: 640,
    desktop: { label: 'Lebenslauf.pdf', kind: 'document', badge: 'PDF', badgeColor: '#E5352B' },
  },
  {
    id: 'wetter',
    component: Wetter,
    title: 'Wetterstation (BMA)',
    menuName: 'Finder',
    x: 300,
    y: 200,
    width: 420,
    height: 'auto',
    icon: { background: '#5AC8FA', Glyph: WetterGlyph },
    finder: 'Wetterstation (BMA)',
  },
  {
    id: 'shop',
    component: ShopOutreach,
    title: 'shop-outreach',
    menuName: 'Finder',
    x: 360,
    y: 240,
    width: 420,
    height: 'auto',
    icon: { background: '#34C759', Glyph: ShopGlyph },
    finder: 'shop-outreach',
  },
];

export const APP_BY_ID = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<
  AppId,
  AppDefinition
>;

/** Reihenfolge der Icons auf dem Schreibtisch (wie in der Design-Referenz). */
export const DESKTOP_ORDER: AppId[] = ['finder', 'cv', 'about', 'kontakt'];

/** Reihenfolge im Dock. */
export const DOCK_ORDER: AppId[] = [
  'finder',
  'terminal',
  'rtr',
  'clipper',
  'ipa',
  'agents',
  'kontakt',
];

/** Reihenfolge im Ordner «Projekte». */
export const FINDER_ORDER: AppId[] = ['rtr', 'clipper', 'ipa', 'agents', 'wetter', 'shop'];

/** Beim ersten Laden offen, von hinten nach vorne. */
export const INITIAL_OPEN: AppId[] = ['terminal', 'finder', 'about'];

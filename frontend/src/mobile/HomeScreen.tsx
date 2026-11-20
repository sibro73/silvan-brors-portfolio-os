import { type MouseEvent, type ReactNode, useRef, useState } from 'react';

import { TIME_ZONE } from '../shared/clock';
import { zurichToday } from '../shared/calendar';
import { profile, projects } from '../shared/content';
import {
  AgentsGlyph,
  ClipperGlyph,
  CvGlyph,
  IpaGlyph,
  RtrGlyph,
  SettingsGlyph,
  ShopGlyph,
  SunGlyph,
} from './icons';
import { HomePage2 } from './HomePage2';
import type { MobileAppId } from './mobileApps';

export type OpenHandler = (id: MobileAppId, from?: HTMLElement) => void;

interface AppIconProps {
  label: string;
  background: string;
  onOpen: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  badge?: boolean;
  tileClass?: string;
}

/** App auf dem Home-Bildschirm: Kachel mit Glyphe und Beschriftung. */
export function AppIcon({ label, background, onOpen, children, badge, tileClass }: AppIconProps) {
  return (
    <button
      type="button"
      className="m-app m-ic"
      onClick={onOpen}
      aria-label={badge ? `${label}, 1 neue Mitteilung` : undefined}
    >
      <span className={`m-app__tile ${tileClass ?? ''}`} style={{ background }}>
        {children}
        {badge && (
          <span className="m-badge" aria-hidden="true">
            1
          </span>
        )}
      </span>
      <span className="m-lbl">{label}</span>
    </button>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function weekdayShort(): string {
  try {
    return new Date()
      .toLocaleDateString('de-CH', { timeZone: TIME_ZONE, weekday: 'short' })
      .replace('.', '');
  } catch {
    return '';
  }
}

interface HomeScreenProps {
  onOpen: OpenHandler;
  /** Eine App ist offen: Home wird kleiner und unscharf. */
  behind: boolean;
  jiggle: boolean;
  badge: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
}

const gradient = (from: string, to: string) => `linear-gradient(160deg, ${from}, ${to})`;

export const PAGE_COUNT = 2;

function reducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

export function HomeScreen({
  onOpen,
  behind,
  jiggle,
  badge,
  onPressStart,
  onPressEnd,
}: HomeScreenProps) {
  const open = (id: MobileAppId) => (e: MouseEvent<HTMLButtonElement>) =>
    onOpen(id, e.currentTarget);
  const today = zurichToday();
  const pages = useRef<HTMLElement>(null);
  const [page, setPage] = useState(0);
  const cls = ['m-home', behind && 'm-home--behind', jiggle && 'm-home--jiggle']
    .filter(Boolean)
    .join(' ');

  const onScroll = () => {
    const el = pages.current;
    if (!el || !el.clientWidth) return;
    setPage(Math.min(PAGE_COUNT - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
  };

  const goToPage = (i: number) => {
    setPage(i);
    const el = pages.current;
    el?.scrollTo?.({ left: i * el.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <>
      <main
        ref={pages}
        aria-label="Home-Bildschirm"
        className={cls}
        onScroll={onScroll}
        onPointerDown={onPressStart}
        onPointerUp={onPressEnd}
        onPointerLeave={onPressEnd}
        onPointerCancel={onPressEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="m-page"
          role="group"
          aria-label={`Seite 1 von ${PAGE_COUNT}`}
          inert={page !== 0 ? true : undefined}
        >
          {/* Widget: Profil (4×2) */}
          <div className="m-widget m-widget--wide">
            <button
              type="button"
              className="m-widget__card m-widget__card--glass m-ic"
              onClick={open('notes')}
            >
              <span className="m-profile__head">
                <span className="m-profile__avatar" aria-hidden="true">
                  {initials(profile.name)}
                </span>
                <span className="m-profile__text">
                  <span className="m-profile__name">{profile.name}</span>
                  <span className="m-profile__role">{profile.tagline}</span>
                </span>
              </span>
              <span className="m-profile__foot">
                <span className="m-profile__tags">
                  {profile.tags.map((t) => (
                    <span key={t} className="m-profile__tag">
                      {t}
                    </span>
                  ))}
                </span>
                <span className="m-profile__more">
                  <span className="m-pulse" aria-hidden="true" />
                  Über mich ›
                </span>
              </span>
            </button>
            <span className="m-lbl" aria-hidden="true">
              Profil
            </span>
          </div>

          {/* Widget: Wetterstation (2×2) */}
          <div className="m-widget m-widget--half">
            <button
              type="button"
              className="m-widget__card m-widget__card--weather m-ic"
              onClick={open('wetter')}
            >
              <span>
                <span className="m-weather__name">{projects.wetter.title}</span>
                <span className="m-weather__temp">{projects.wetter.temperature}</span>
              </span>
              <span className="m-weather__foot">
                <SunGlyph />
                <span>{projects.wetter.widget}</span>
              </span>
            </button>
            <span className="m-lbl" aria-hidden="true">
              Wetter
            </span>
          </div>

          <AppIcon label="Rigged" background={gradient('#D0243F', '#7A0E1C')} onOpen={open('rtr')}>
            <RtrGlyph />
          </AppIcon>
          <AppIcon
            label="Clipper"
            background={gradient('#3FB0F0', '#1667B8')}
            onOpen={open('clipper')}
            badge={badge}
          >
            <ClipperGlyph />
          </AppIcon>
          <AppIcon label="IPA" background={gradient('#8466F0', '#4A2FB0')} onOpen={open('ipa')}>
            <IpaGlyph />
          </AppIcon>
          <AppIcon
            label="Agents"
            background={gradient('#FFA24D', '#E0601A')}
            onOpen={open('agents')}
          >
            <AgentsGlyph />
          </AppIcon>
          <AppIcon label="Shops" background={gradient('#E25597', '#8E1F57')} onOpen={open('shop')}>
            <ShopGlyph />
          </AppIcon>
          <AppIcon
            label="Lebenslauf"
            background={gradient('#474B66', '#1E1F2B')}
            onOpen={open('cv')}
          >
            <CvGlyph />
          </AppIcon>
          <AppIcon
            label="Kalender"
            background="#FFFFFF"
            tileClass="m-cal-icon"
            onOpen={open('kalender')}
          >
            <span className="m-cal-icon__wd" aria-hidden="true">
              {weekdayShort()}
            </span>
            <span className="m-cal-icon__day" aria-hidden="true">
              {today.day}
            </span>
          </AppIcon>
          <AppIcon
            label="Einstellungen"
            background={gradient('#8A8FA8', '#4E5266')}
            onOpen={open('settings')}
          >
            <SettingsGlyph />
          </AppIcon>
        </div>
        <div
          className="m-page"
          role="group"
          aria-label={`Seite 2 von ${PAGE_COUNT}`}
          inert={page !== 1 ? true : undefined}
        >
          <HomePage2 onOpen={onOpen} />
        </div>
      </main>
      <div className="m-dots m-dockin">
        {Array.from({ length: PAGE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            className="m-dots__btn"
            aria-label={`Seite ${i + 1}`}
            aria-current={page === i}
            onClick={() => goToPage(i)}
          >
            <span />
          </button>
        ))}
      </div>
    </>
  );
}

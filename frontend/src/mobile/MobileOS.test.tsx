import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WALLPAPER_KEY } from '../shared/wallpaper';
import { EXAMPLE_TYPING_MS } from './apps/Ipa';
import { OPEN_DELAY_MS } from './apps/Terminal';
import { MOBILE_APPS } from './mobileApps';
import MobileOS, {
  CLOSE_MS,
  LONG_PRESS_MS,
  NOTIFICATION_HIDE_MS,
  NOTIFICATION_SHOW_MS,
  TOAST_MS,
} from './MobileOS';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
});

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const home = () => screen.getByRole('main', { name: 'Home-Bildschirm' });
const sheet = (title: string) => screen.queryByRole('region', { name: title });
const tap = (el: HTMLElement) => act(() => fireEvent.click(el));

/** Home-Button tippen und warten, bis Browser-Zurück und Zoom-Animation fertig sind. */
async function goHome() {
  tap(screen.getByRole('button', { name: 'Home' }));
  // jsdom feuert popstate nach history.back() asynchron
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  advance(CLOSE_MS);
}

/** Wie man jede App vom Home-Bildschirm oder Dock aus öffnet. */
const LAUNCHERS: Record<keyof typeof MOBILE_APPS, () => HTMLElement> = {
  rtr: () => screen.getByRole('button', { name: 'Rigged' }),
  clipper: () => screen.getByRole('button', { name: /^Clipper/ }),
  ipa: () => screen.getByRole('button', { name: 'IPA' }),
  agents: () => screen.getByRole('button', { name: 'Agents' }),
  wetter: () => screen.getByRole('button', { name: /Wetterstation/ }),
  shop: () => screen.getByRole('button', { name: 'Shops' }),
  cv: () => screen.getByRole('button', { name: 'Lebenslauf' }),
  kalender: () => screen.getByRole('button', { name: /Kalender/ }),
  settings: () => screen.getByRole('button', { name: 'Einstellungen' }),
  kontakt: () => screen.getByRole('button', { name: 'Mail: Kontakt' }),
  notes: () => screen.getByRole('button', { name: 'Notizen: Über mich' }),
  terminal: () => screen.getByRole('button', { name: 'Terminal' }),
  welcome: () => screen.getByRole('button', { name: 'Willkommen' }),
};

describe('MobileOS', () => {
  it('shows the home screen with widgets, apps and dock, but no fake status bar', () => {
    render(<MobileOS />);
    expect(home()).toBeInTheDocument();
    expect(screen.getByText('Silvan Brors')).toBeInTheDocument();
    expect(screen.getByText('[°C]')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Dock' })).toBeInTheDocument();
    expect(screen.getByText('Tippe auf eine App, um sie zu öffnen')).toBeInTheDocument();
    expect(screen.queryByText(/^\d{2}:\d{2}$/)).toBeNull();
  });

  it.each(Object.entries(LAUNCHERS))('opens and closes %s', async (id, launcher) => {
    render(<MobileOS />);
    const title = MOBILE_APPS[id as keyof typeof MOBILE_APPS].title;
    tap(launcher());
    expect(sheet(title)).toHaveClass('m-sheet--in');
    expect(home()).toHaveClass('m-home--behind');

    await goHome();
    expect(sheet(title)).toBeNull();
    expect(home()).not.toHaveClass('m-home--behind');
  });

  it('zooms from the tapped icon and back, unmounting only after the animation', async () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'IPA' }));
    const app = sheet('IPA-Assistent')!;
    expect(app.style.transformOrigin).toMatch(/%/);

    tap(screen.getByRole('button', { name: 'Zum Home-Bildschirm' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(sheet('IPA-Assistent')).toHaveClass('m-sheet--out');
    advance(CLOSE_MS);
    expect(sheet('IPA-Assistent')).toBeNull();
  });

  it('pushes a history entry, and browser back closes the app', () => {
    const push = vi.spyOn(window.history, 'pushState');
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Shops' }));
    expect(push).toHaveBeenCalledWith({ silvanosApp: 'shop' }, '');

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });
    expect(sheet('shop-outreach')).toHaveClass('m-sheet--out');
    advance(CLOSE_MS);
    expect(sheet('shop-outreach')).toBeNull();
  });

  it('long press starts the jiggle mode, taps do nothing until «Fertig»', () => {
    render(<MobileOS />);
    act(() => fireEvent.pointerDown(home()));
    advance(LONG_PRESS_MS);
    expect(home()).toHaveClass('m-home--jiggle');
    expect(screen.getByText('Tippe auf «Fertig», um zu beenden')).toBeInTheDocument();

    tap(screen.getByRole('button', { name: 'Rigged' }));
    expect(sheet('Rigged to Riches')).toBeNull();

    tap(screen.getByRole('button', { name: 'Fertig' }));
    expect(home()).not.toHaveClass('m-home--jiggle');
    tap(screen.getByRole('button', { name: 'Rigged' }));
    expect(sheet('Rigged to Riches')).toBeInTheDocument();
  });

  it('a short press does not start the jiggle mode', () => {
    render(<MobileOS />);
    act(() => fireEvent.pointerDown(home()));
    advance(LONG_PRESS_MS / 2);
    act(() => fireEvent.pointerUp(home()));
    advance(LONG_PRESS_MS);
    expect(home()).not.toHaveClass('m-home--jiggle');
  });

  it('shows the clipper notification after 6 s, hides it after 14 s', () => {
    render(<MobileOS />);
    expect(screen.getByRole('button', { name: 'Clipper, 1 neue Mitteilung' })).toBeInTheDocument();
    advance(NOTIFICATION_SHOW_MS);
    expect(screen.getByText('Neuer Clip ist fertig. Tippe zum Ansehen.')).toBeInTheDocument();
    advance(NOTIFICATION_HIDE_MS - NOTIFICATION_SHOW_MS);
    expect(screen.queryByText('Neuer Clip ist fertig. Tippe zum Ansehen.')).toBeNull();
  });

  it('tapping the notification opens Telegram and clears the badge', () => {
    render(<MobileOS />);
    advance(NOTIFICATION_SHOW_MS);
    tap(screen.getByRole('button', { name: /Clipper Bot/ }));
    expect(sheet('Telegram')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clipper, 1 neue Mitteilung' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Clipper' })).toBeInTheDocument();
    expect(screen.queryByText('Neuer Clip ist fertig. Tippe zum Ansehen.')).toBeNull();
  });

  it('buttons without a target show a short toast', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Rigged' }));
    tap(screen.getByRole('button', { name: 'Auf die Wunschliste' }));
    expect(screen.getByRole('status')).toHaveTextContent('Steam-Link folgt');
    advance(TOAST_MS);
    expect(screen.queryByText('Steam-Link folgt')).toBeNull();
  });

  it('settings change the wallpaper and save it under the shared key', () => {
    const { container } = render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Einstellungen' }));
    tap(screen.getByRole('radio', { name: /Casino/ }));
    expect(screen.getByRole('radio', { name: /Casino/ })).toHaveAttribute('aria-checked', 'true');
    expect(container.firstChild).toHaveClass('m-wall-casino');
    expect(window.localStorage.getItem(WALLPAPER_KEY)).toBe('casino');
  });

  it('terminal runs commands and opens apps', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Terminal' }));
    const input = screen.getByRole('textbox', { name: /Befehl/ });
    expect(input).toHaveStyle({ fontSize: '16px' });

    act(() => {
      fireEvent.change(input, { target: { value: 'whoami' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(screen.getByText('~ % whoami')).toBeInTheDocument();
    expect(screen.getByText('silvan brors')).toBeInTheDocument();

    tap(screen.getByRole('button', { name: 'open rtr' }));
    expect(screen.getByText('öffne rtr …')).toBeInTheDocument();
    advance(OPEN_DELAY_MS);
    expect(sheet('Rigged to Riches')).toBeInTheDocument();
    expect(sheet('Terminal')).toBeNull();
  });

  it('IPA chat shows typing dots, then the example answer', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'IPA' }));
    const app = sheet('IPA-Assistent')!;
    tap(within(app).getByRole('button', { name: 'Was heisst IPERKA?' }));
    expect(within(app).getByRole('status', { name: 'schreibt' })).toBeInTheDocument();
    advance(EXAMPLE_TYPING_MS);
    expect(within(app).queryByRole('status', { name: 'schreibt' })).toBeNull();
    expect(within(app).getByText(/Informieren, Planen, Entscheiden/)).toBeInTheDocument();
  });

  it('contact: message field is labelled and at least 16px, profile links are real', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Mail: Kontakt' }));
    const message = screen.getByRole('textbox', { name: 'Nachricht' });
    expect(message).toHaveStyle({ fontSize: '16px' });
    expect(screen.getByText(/silvan\.brors@icloud\.com/)).toBeInTheDocument();
    act(() => fireEvent.change(message, { target: { value: 'Hoi Silvan & Co.' } }));
    expect(screen.getByRole('link', { name: 'Senden' })).toHaveAttribute(
      'href',
      'mailto:silvan.brors@icloud.com?subject=Hallo%20Silvan&body=Hoi%20Silvan%20%26%20Co.',
    );
    expect(within(sheet('Neue E-Mail')!).getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/silvan-brors-b91b62287/',
    );
    expect(screen.getByRole('link', { name: /GitHub \(öffnet/ })).toHaveAttribute(
      'href',
      'https://github.com/sibro73',
    );
  });

  it('has a second home page with live numbers, next event and report', () => {
    render(<MobileOS />);
    const page2 = screen.getByRole('group', { name: 'Seite 2 von 2' });
    expect(
      within(page2).getByRole('button', { name: /Live-Zahlen: Wishlists \[live\]/ }),
    ).toBeInTheDocument();
    expect(within(page2).getByText('Steam Next Fest')).toBeInTheDocument();
    expect(within(page2).getByText('Wochenbericht')).toBeInTheDocument();
    expect(within(page2).getByRole('link', { name: 'Klassische Ansicht' })).toHaveAttribute(
      'href',
      '/klassisch',
    );

    // Seitenpunkte: Seite 1 aktiv, Seite 2 per Tipp
    const dot1 = screen.getByRole('button', { name: 'Seite 1' });
    const dot2 = screen.getByRole('button', { name: 'Seite 2' });
    expect(dot1).toHaveAttribute('aria-current', 'true');
    tap(dot2);
    expect(dot2).toHaveAttribute('aria-current', 'true');
    expect(dot1).toHaveAttribute('aria-current', 'false');

    // Widgets öffnen ihre App
    tap(within(page2).getByRole('button', { name: /Wochenbericht/ }));
    expect(sheet('Wochenbericht')).toBeInTheDocument();
  });

  it('CV shows the preview and downloads the PDF', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Lebenslauf' }));
    expect(screen.getByRole('img', { name: /Vorschau des Lebenslaufs/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PDF herunterladen' })).toHaveAttribute(
      'href',
      '/media/lebenslauf.pdf',
    );
  });

  it('project apps explain the project and link public code', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Shops' }));
    const info = within(sheet('shop-outreach')!).getByRole('region', { name: 'Über das Projekt' });
    expect(within(info).getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/sibro73/shop-outreach',
    );
  });

  it('back never opens another app, also with old history entries after a reload', () => {
    // Nach Neuladen in den Einstellungen steht im Verlauf noch «Einstellungen offen»
    window.history.replaceState({ silvanosApp: 'settings' }, '');
    render(<MobileOS />);
    expect(window.history.state).toBeNull();

    tap(screen.getByRole('button', { name: 'Rigged' }));
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { silvanosApp: 'settings' } }));
    });
    advance(CLOSE_MS);
    expect(sheet('Rigged to Riches')).toBeNull();
    expect(sheet('Einstellungen')).toBeNull();
  });

  it('the start page opens as an app and leads to the projects', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Willkommen' }));
    const start = sheet('Willkommen')!;
    expect(within(start).getByText('Portfolio von Silvan Brors')).toBeInTheDocument();
    expect(within(start).getByText(/Python · FFmpeg · streamlink/)).toBeInTheDocument();
    tap(within(start).getByRole('button', { name: /Clipper/ }));
    expect(sheet('Telegram')).toBeInTheDocument();
    expect(sheet('Willkommen')).toBeNull();
  });

  it('CV preview opens the large view, closed with ✕', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Lebenslauf' }));
    tap(screen.getByRole('button', { name: 'Lebenslauf vergrössern' }));
    const viewer = screen.getByRole('dialog', { name: 'Lebenslauf gross ansehen' });
    tap(within(viewer).getByRole('button', { name: 'Vergrössern' }));
    expect(viewer).toHaveTextContent('150 %');
    tap(within(viewer).getByRole('button', { name: 'Schliessen' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(sheet('Lebenslauf.pdf')).toBeInTheDocument();
  });

  it('project apps show the real project image', () => {
    render(<MobileOS />);
    tap(screen.getByRole('button', { name: 'Rigged' }));
    const info = within(sheet('Rigged to Riches')!).getByRole('region', {
      name: 'Über das Projekt',
    });
    expect(within(info).getByRole('img', { name: /Casino der Stadt Las Agné/ })).toHaveAttribute(
      'src',
      '/media/projects/rtr.webp',
    );
  });
});

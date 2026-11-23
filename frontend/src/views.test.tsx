import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import App from './App';
import { layoutInitialWindows, MENU_BAR_HEIGHT } from './desktop/initialWindows';
import { mockViewportWidth } from './test/matchMedia';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  window.history.replaceState(null, '', '/');
});

/** Beide Ansichten laden nach (React.lazy). Im vollen Testlauf kann das länger als 1 s dauern. */
const LAZY = { timeout: 10_000 };
const homeScreen = () => screen.findByRole('main', { name: 'Home-Bildschirm' }, LAZY);
const menuBar = () => screen.findByTestId('active-app', {}, LAZY);

describe('views', () => {
  it('shows only the phone view below 860 px', async () => {
    mockViewportWidth(390);
    render(<App />);
    expect(await homeScreen()).toBeInTheDocument();
    expect(screen.queryByTestId('active-app')).toBeNull();
    // Handy: beim Start nur das Willkommen-Fenster, kein Terminal
    expect(screen.getByRole('region', { name: 'Willkommen' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'silvan — zsh — 80×24' })).toBeNull();
  });

  it('shows only the desktop from 860 px', async () => {
    mockViewportWidth(860);
    render(<App />);
    expect(await menuBar()).toBeInTheDocument();
    const start = layoutInitialWindows({
      width: window.innerWidth,
      height: window.innerHeight - MENU_BAR_HEIGHT,
    });
    for (const r of start) {
      const name = r.id === 'welcome' ? 'Willkommen' : 'silvan — zsh — 80×24';
      expect(screen.getByRole('region', { name })).toHaveStyle({
        left: `${r.x}px`,
        top: `${r.y}px`,
        width: `${r.width}px`,
      });
    }
    expect(screen.queryByRole('main', { name: 'Home-Bildschirm' })).toBeNull();
  });

  it('switches live when the window is resized', async () => {
    const viewport = mockViewportWidth(1440);
    render(<App />);
    expect(await menuBar()).toBeInTheDocument();

    act(() => viewport.resize(390));
    expect(await homeScreen()).toBeInTheDocument();
    expect(screen.queryByTestId('active-app')).toBeNull();

    act(() => viewport.resize(1440));
    expect(await menuBar()).toBeInTheDocument();
    expect(screen.queryByRole('main', { name: 'Home-Bildschirm' })).toBeNull();
  });

  it('/klassisch shows the classic page, «Silvan OS öffnen» returns to the desktop', async () => {
    render(<App />);
    expect(await menuBar()).toBeInTheDocument();

    // Desktop: Menü «Klassische Ansicht» bzw. Link im Willkommensfenster
    await userEvent.click(screen.getByRole('link', { name: 'Klassische Ansicht' }));
    expect(window.location.pathname).toBe('/klassisch');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Ich baue Backends/ }, LAZY),
    ).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Dock' })).toBeNull();
    expect(document.title).toBe('Silvan Brors – Portfolio');

    await userEvent.click(screen.getByRole('link', { name: 'Silvan OS öffnen ↗' }));
    expect(window.location.pathname).toBe('/');
    expect(await screen.findByRole('navigation', { name: 'Dock' }, LAZY)).toBeInTheDocument();
  });

  it('browser back leaves the classic page again', async () => {
    window.history.pushState(null, '', '/klassisch');
    render(<App />);
    expect(await screen.findByRole('heading', { level: 1 }, LAZY)).toHaveTextContent(
      'Ich baue Backends',
    );
    act(() => {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await menuBar()).toBeInTheDocument();
  });
});

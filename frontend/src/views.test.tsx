import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import App from './App';
import { mockViewportWidth } from './test/matchMedia';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  window.location.hash = '';
});

/** Beide Ansichten laden nach (React.lazy): auf die erste Ansicht warten. */
const homeScreen = () => screen.findByRole('main', { name: 'Home-Bildschirm' });
const menuBar = () => screen.findByTestId('active-app');

describe('views', () => {
  it('shows only the phone view below 860 px', async () => {
    mockViewportWidth(390);
    render(<App />);
    expect(await homeScreen()).toBeInTheDocument();
    expect(screen.queryByTestId('active-app')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Willkommen' })).toBeNull();
  });

  it('shows only the desktop from 860 px', async () => {
    mockViewportWidth(860);
    render(<App />);
    expect(await menuBar()).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Willkommen' })).toHaveStyle({
      left: '24px',
      top: '24px',
    });
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

  it('shows the classic view for #klassisch and returns to the desktop', async () => {
    render(<App />);
    expect(await menuBar()).toBeInTheDocument();
    act(() => {
      window.location.hash = '#klassisch';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByRole('heading', { level: 1, name: 'Silvan Brors' })).toHaveFocus();
    expect(screen.queryByRole('navigation', { name: 'Dock' })).toBeNull();
    for (const name of ['Über mich', 'Projekte', 'Lebenslauf', 'Kontakt']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByText(/Wishlists: \[live\]/)).toBeInTheDocument();

    act(() => {
      window.location.hash = '#desktop';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(await screen.findByRole('navigation', { name: 'Dock' })).toBeInTheDocument();
  });
});

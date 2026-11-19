import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import App from './App';
import { mockViewportWidth } from './test/matchMedia';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  window.location.hash = '';
});

describe('views', () => {
  it('stacks windows below 860 px', () => {
    mockViewportWidth(390);
    render(<App />);
    const about = screen.getByRole('region', { name: 'Über mich.txt' });
    expect(about).toHaveStyle({ position: 'relative', width: '100%' });
    expect(screen.getByRole('navigation', { name: 'Dock' })).toHaveClass('dock--narrow');
  });

  it('uses the free desktop from 860 px', () => {
    mockViewportWidth(860);
    render(<App />);
    expect(screen.getByRole('region', { name: 'Über mich.txt' })).toHaveStyle({ left: '90px' });
  });

  it('switches layout when the window is resized', () => {
    const viewport = mockViewportWidth(1440);
    render(<App />);
    act(() => viewport.resize(500));
    expect(screen.getByRole('region', { name: 'Über mich.txt' })).toHaveStyle({
      position: 'relative',
    });
  });

  it('shows the classic view for #klassisch and returns to the desktop', () => {
    render(<App />);
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
    expect(screen.getByRole('navigation', { name: 'Dock' })).toBeInTheDocument();
  });
});

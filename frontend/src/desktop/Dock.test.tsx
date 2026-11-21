import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AppId } from './apps.registry';
import { Dock } from './Dock';
import { DOCK_MAX_SCALE, DOCK_RANGE, dockScale } from './dockMagnification';

const originalMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

const tooltips = () =>
  Array.from(document.querySelectorAll('.dock__tooltip')).map((t) => t.textContent);

describe('dockScale', () => {
  it('is largest right under the pointer', () => {
    expect(dockScale(0)).toBeCloseTo(DOCK_MAX_SCALE);
  });

  it('lets neighbours grow a little and falls off smoothly', () => {
    const near = dockScale(40);
    const far = dockScale(90);
    expect(near).toBeLessThan(DOCK_MAX_SCALE);
    expect(far).toBeLessThan(near);
    expect(far).toBeGreaterThan(1);
    expect(dockScale(-40)).toBeCloseTo(near);
  });

  it('does not grow outside the range', () => {
    expect(dockScale(DOCK_RANGE)).toBe(1);
    expect(dockScale(500)).toBe(1);
  });
});

describe('Dock', () => {
  it('lists the dock apps in reference order with a name tooltip', () => {
    render(<Dock running={new Set()} onOpen={() => {}} />);
    expect(tooltips()).toEqual([
      'Willkommen',
      'Finder',
      'Terminal',
      'Rigged to Riches',
      'Telegram',
      'IPA-Assistent',
      'Wochenbericht',
      'Mail',
    ]);
    // Tooltip ist nur visuell, der Name steckt im aria-label
    expect(screen.getByRole('button', { name: 'Terminal öffnen' })).toBeInTheDocument();
  });

  it('shows a dot for running apps only', () => {
    render(<Dock running={new Set<AppId>(['terminal'])} onOpen={() => {}} />);
    expect(screen.getByTestId('dot-terminal')).toHaveClass('dock__dot--on');
    expect(screen.getByTestId('dot-finder')).not.toHaveClass('dock__dot--on');
    expect(screen.getByRole('button', { name: 'Terminal öffnen (geöffnet)' })).toBeInTheDocument();
  });

  it('opens the app on click', async () => {
    const onOpen = vi.fn();
    render(<Dock running={new Set()} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('button', { name: 'Telegram öffnen' }));
    expect(onOpen).toHaveBeenCalledWith('clipper');
  });

  it('magnifies icons near the pointer and resets on leave', () => {
    render(<Dock running={new Set()} onOpen={() => {}} />);
    const dock = screen.getByRole('navigation', { name: 'Dock' });
    const item = screen.getByTestId('dock-finder');
    vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 800, 52, 60));
    fireEvent.pointerMove(dock, { clientX: 126, pointerType: 'mouse' });
    expect(Number(item.style.getPropertyValue('--scale'))).toBeCloseTo(DOCK_MAX_SCALE, 2);
    fireEvent.pointerLeave(dock);
    expect(item.style.getPropertyValue('--scale')).toBe('');
  });

  it('does not magnify with reduced motion (tooltip only)', () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    render(<Dock running={new Set()} onOpen={() => {}} />);
    const dock = screen.getByRole('navigation', { name: 'Dock' });
    expect(dock).not.toHaveClass('dock--magnify');
    fireEvent.pointerMove(dock, { clientX: 0, pointerType: 'mouse' });
    expect(screen.getByTestId('dock-finder').style.getPropertyValue('--scale')).toBe('');
    expect(tooltips()).toHaveLength(8);
  });
});

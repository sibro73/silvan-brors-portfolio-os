import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MenuBar } from './MenuBar';

describe('MenuBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-19T13:05:30Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the active app name', () => {
    render(<MenuBar activeName="Terminal" />);
    expect(screen.getByTestId('active-app')).toHaveTextContent('Terminal');
  });

  it('ticks the clock every second', () => {
    render(<MenuBar activeName="Finder" />);
    expect(screen.getByText(/14:05$/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByText(/14:06$/)).toBeInTheDocument();
  });

  it('links to the classic view', () => {
    render(<MenuBar activeName="Finder" />);
    expect(screen.getByRole('link', { name: 'Klassische Ansicht' })).toHaveAttribute(
      'href',
      '#klassisch',
    );
  });
});

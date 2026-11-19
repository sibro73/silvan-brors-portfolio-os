import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AppId } from '../apps.registry';
import { Dock } from './Dock';

describe('Dock', () => {
  it('lists the dock apps in reference order', () => {
    render(<Dock running={new Set()} narrow={false} onOpen={() => {}} />);
    const titles = screen.getAllByRole('button').map((b) => b.getAttribute('title'));
    expect(titles).toEqual([
      'Finder',
      'Terminal',
      'Rigged to Riches',
      'Telegram',
      'IPA-Assistent',
      'Wochenbericht',
      'Mail',
    ]);
  });

  it('shows a dot for running apps only', () => {
    render(<Dock running={new Set<AppId>(['terminal'])} narrow={false} onOpen={() => {}} />);
    expect(screen.getByTestId('dot-terminal')).toHaveClass('dock__dot--on');
    expect(screen.getByTestId('dot-finder')).not.toHaveClass('dock__dot--on');
    expect(screen.getByRole('button', { name: 'Terminal öffnen (geöffnet)' })).toBeInTheDocument();
  });

  it('opens the app on click', async () => {
    const onOpen = vi.fn();
    render(<Dock running={new Set()} narrow={false} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('button', { name: 'Telegram öffnen' }));
    expect(onOpen).toHaveBeenCalledWith('clipper');
  });
});

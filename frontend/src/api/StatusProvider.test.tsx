import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RiggedToRiches } from '../apps/rigged-to-riches/RiggedToRiches';
import { Terminal } from '../apps/terminal/Terminal';
import { status as fallback } from '../data';
import type { StatusResult } from './status';
import { StatusProvider } from './StatusProvider';

const live: StatusResult = {
  status: { wishlists: 120, clipsHeute: 4, ipaFragen: 37, letzterBericht: '2026-11-16' },
  source: 'live',
  latencyMs: 42,
};

describe('StatusProvider', () => {
  it('shows placeholders first and live numbers once loaded', async () => {
    render(
      <StatusProvider load={() => Promise.resolve(live)}>
        <RiggedToRiches />
      </StatusProvider>,
    );
    expect(await screen.findByText('Wishlists: 120')).toBeInTheDocument();
  });

  it('keeps the placeholders when the backend is unavailable', async () => {
    let resolve!: (r: StatusResult) => void;
    render(
      <StatusProvider load={() => new Promise((r) => (resolve = r))}>
        <RiggedToRiches />
      </StatusProvider>,
    );
    expect(screen.getByText('Wishlists: [live]')).toBeInTheDocument();
    resolve({ status: fallback, source: 'fallback' });
    expect(await screen.findByText('Wishlists: [live]')).toBeInTheDocument();
  });

  it('feeds the terminal curl command', async () => {
    render(
      <StatusProvider load={() => Promise.resolve(live)}>
        <Terminal openApp={() => {}} closeSelf={() => {}} />
      </StatusProvider>,
    );
    await screen.findByLabelText('Befehl eingeben');
    // warten, bis der Status geladen ist
    await new Promise((r) => setTimeout(r, 0));
    await userEvent.type(screen.getByLabelText('Befehl eingeben'), 'curl /api/status{Enter}');
    const log = screen.getByRole('log');
    expect(log).toHaveTextContent('{ "wishlists": 120, "clipsHeute": 4,');
    expect(log).not.toHaveTextContent('Offline-Modus');
  });
});

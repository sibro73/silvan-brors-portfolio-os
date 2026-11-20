import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StatusProvider } from '../../api/StatusProvider';
import { defaultPosition } from '../../apps.registry';
import { Welcome } from './Welcome';

function setup() {
  const openApp = vi.fn();
  render(<Welcome openApp={openApp} closeSelf={() => {}} />);
  return { openApp };
}

describe('Welcome', () => {
  it('says right away that this is a portfolio', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Portfolio von Silvan Brors' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Applikationsentwickler EFZ · ti&m · Zürich')).toBeInTheDocument();
    for (const keyword of ['Java', 'Spring', 'Backend', 'automatisiere']) {
      expect(screen.getByText(keyword).tagName).toBe('MARK');
    }
    expect(
      screen.getByText('Fenster lassen sich verschieben. Im Terminal kannst du Befehle tippen.'),
    ).toBeInTheDocument();
  });

  it('has four project cards that open their apps', async () => {
    const { openApp } = setup();
    const cards = within(screen.getByRole('group', { name: 'Projekte' })).getAllByRole('listitem');
    expect(cards.map((c) => within(c).getByRole('heading').textContent)).toEqual([
      'Rigged to Riches',
      'Clipper',
      'IPA-Lernassistent',
      'Marketing-Agents',
    ]);
    for (const [label, id] of [
      ['Rigged to Riches öffnen', 'rtr'],
      ['Clipper öffnen', 'clipper'],
      ['IPA-Lernassistent öffnen', 'ipa'],
      ['Marketing-Agents öffnen', 'agents'],
    ]) {
      await userEvent.click(screen.getByRole('button', { name: label }));
      expect(openApp).toHaveBeenLastCalledWith(id);
    }
  });

  it('CV, contact and classic view buttons', async () => {
    const { openApp } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Lebenslauf' }));
    expect(openApp).toHaveBeenLastCalledWith('cv');
    await userEvent.click(screen.getByRole('button', { name: 'Kontakt' }));
    expect(openApp).toHaveBeenLastCalledWith('kontakt');
    expect(screen.getByRole('link', { name: 'Klassische Ansicht' })).toHaveAttribute(
      'href',
      '#klassisch',
    );
  });

  it('shows stored placeholders while offline', () => {
    setup();
    const live = screen.getByRole('group', { name: 'Live-Zahlen' });
    expect(live).toHaveTextContent('Wishlists[live]');
    expect(live).toHaveTextContent('Letzter Bericht[Datum]');
    expect(live).toHaveTextContent('gespeicherte Daten');
  });

  it('shows live numbers from /api/status', async () => {
    render(
      <StatusProvider
        load={() =>
          Promise.resolve({
            status: { wishlists: 120, clipsHeute: 4, ipaFragen: 37, letzterBericht: '2026-11-16' },
            source: 'live',
            latencyMs: 20,
          })
        }
      >
        <Welcome openApp={() => {}} closeSelf={() => {}} />
      </StatusProvider>,
    );
    const live = screen.getByRole('group', { name: 'Live-Zahlen' });
    expect(await within(live).findByText('120')).toBeInTheDocument();
    expect(live).toHaveTextContent('live aus /api/status');
  });

  it('opens top left, independent of the desktop size', () => {
    expect(defaultPosition('welcome', { width: 1440, height: 870 })).toEqual({ x: 24, y: 24 });
    expect(defaultPosition('welcome', { width: 900, height: 600 })).toEqual({ x: 24, y: 24 });
  });

  it('puts the terminal bottom right, next to the desktop icons and above the dock', () => {
    // unter den Icons: an den Rand (1440 - 600 - 16, 872 - 340 - 96)
    expect(defaultPosition('terminal', { width: 1440, height: 872 })).toEqual({ x: 824, y: 436 });
    // auf Höhe der Icons: Icon-Spalte bleibt frei (1280 - 600 - 124, 720 - 340 - 96)
    expect(defaultPosition('terminal', { width: 1280, height: 720 })).toEqual({ x: 556, y: 284 });
    // kleiner Desktop: nie aus dem Bild
    expect(defaultPosition('terminal', { width: 700, height: 400 })).toEqual({ x: 16, y: 16 });
  });
});

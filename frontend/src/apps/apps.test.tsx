import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { APPS } from '../apps.registry';
import { About } from './about/About';
import { Wochenbericht } from './agents/Wochenbericht';
import { Clipper } from './clipper/Clipper';
import { Finder } from './finder/Finder';
import { IpaAssistent } from './ipa-assistent/IpaAssistent';
import { Lebenslauf } from './lebenslauf/Lebenslauf';
import { Mail } from './mail/Mail';
import { RiggedToRiches } from './rigged-to-riches/RiggedToRiches';

const noop = { openApp: () => {}, closeSelf: () => {} };

describe('apps', () => {
  it('every app except the terminal has a component (terminal follows)', () => {
    const missing = APPS.filter((a) => !a.component).map((a) => a.id);
    expect(missing.every((id) => id === 'terminal')).toBe(true);
  });

  it('About shows greeting and highlights', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: 'Hallo, ich bin Silvan.' })).toBeInTheDocument();
    expect(screen.getByText('Java').tagName).toBe('MARK');
  });

  it('Finder lists the projects and opens them', async () => {
    const openApp = vi.fn();
    render(<Finder {...noop} openApp={openApp} />);
    const labels = screen.getAllByRole('button').map((b) => b.textContent);
    expect(labels).toEqual([
      'Rigged to Riches',
      'Clipper',
      'IPA-Assistent',
      'Marketing-Agents',
      'Wetterstation (BMA)',
      'shop-outreach',
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Marketing-Agents' }));
    expect(openApp).toHaveBeenCalledWith('agents');
  });

  it('Rigged to Riches keeps the live placeholder', () => {
    render(<RiggedToRiches />);
    expect(screen.getByText('Wishlists: [live]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Auf die Wunschliste' })).toBeInTheDocument();
  });

  it('Clipper keeps its placeholders', () => {
    render(<Clipper />);
    expect(screen.getByText('[Streamer A]')).toBeInTheDocument();
    expect(screen.getByText('Fertig in [Sek.] s, bereit zum Posten')).toBeInTheDocument();
  });

  it('IPA-Assistent answers an example question with its source', async () => {
    render(<IpaAssistent />);
    expect(screen.queryByText(/Quelle:/)).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Image oder Container?' }));
    expect(screen.getByText(/unveränderliche Vorlage/)).toBeInTheDocument();
    expect(screen.getByText('Quelle: notizen/docker.md')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image oder Container?' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Wochenbericht shows all channels', () => {
    render(<Wochenbericht />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('[KW]')).toBeInTheDocument();
  });

  it('Mail keeps the e-mail placeholder', () => {
    render(<Mail />);
    expect(screen.getByRole('link', { name: 'Senden' })).toHaveAttribute(
      'href',
      'mailto:[deine@email.ch]?subject=Hallo%20Silvan',
    );
  });

  it('Lebenslauf shows the embed placeholder', () => {
    render(<Lebenslauf />);
    expect(screen.getByText('[Lebenslauf als PDF einbetten]')).toBeInTheDocument();
  });
});

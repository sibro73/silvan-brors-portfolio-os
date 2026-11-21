import type { ComponentType } from 'react';
import { render, screen, within } from '@testing-library/react';
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
import { ShopOutreach } from './shop-outreach/ShopOutreach';
import { Wetter } from './wetter/Wetter';

const noop = { openApp: () => {}, closeSelf: () => {} };

describe('apps', () => {
  it('every app has a window component', () => {
    expect(APPS.every((a) => typeof a.component === 'function')).toBe(true);
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
    expect(screen.getByText('Beispielantwort · Quelle: notizen/docker.md')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image oder Container?' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Wochenbericht shows all channels', () => {
    render(<Wochenbericht />);
    expect(
      within(screen.getByRole('list', { name: 'Views pro Kanal' })).getAllByRole('listitem'),
    ).toHaveLength(4);
    expect(screen.getByText('[KW]')).toBeInTheDocument();
  });

  it('Mail sends to the real address', () => {
    render(<Mail />);
    expect(screen.getByRole('link', { name: 'Senden' })).toHaveAttribute(
      'href',
      'mailto:silvan.brors@icloud.com?subject=Hallo%20Silvan',
    );
  });

  it('Lebenslauf shows the preview and downloads the PDF', () => {
    render(<Lebenslauf />);
    expect(screen.getByRole('img', { name: /Vorschau des Lebenslaufs/ })).toHaveAttribute(
      'src',
      '/media/lebenslauf.webp',
    );
    const link = screen.getByRole('link', { name: 'PDF herunterladen' });
    expect(link).toHaveAttribute('href', '/media/lebenslauf.pdf');
    expect(link).toHaveAttribute('download');
  });

  it('every project window explains the project and links public code', () => {
    const cases: [ComponentType, string, string | null][] = [
      [RiggedToRiches, 'Der Code des Spiels ist privat.', null],
      [Clipper, '', 'https://github.com/sibro73/stream-clipper-script'],
      [ShopOutreach, '', 'https://github.com/sibro73/shop-outreach'],
      [Wochenbericht, 'Der Code ist privat.', null],
      [Wetter, 'Fotos folgen.', null],
    ];
    for (const [App, note, repo] of cases) {
      const { unmount } = render(<App />);
      const info = screen.getByRole('region', { name: 'Über das Projekt' });
      if (repo)
        expect(within(info).getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', repo);
      else expect(info).toHaveTextContent(note);
      unmount();
    }
  });

  it('Lebenslauf opens a zoomable large view and closes with Escape', async () => {
    render(<Lebenslauf />);
    await userEvent.click(screen.getByRole('button', { name: 'Lebenslauf vergrössern' }));
    const viewer = screen.getByRole('dialog', { name: 'Lebenslauf gross ansehen' });
    expect(within(viewer).getByRole('img')).toHaveAttribute('src', '/media/lebenslauf-gross.webp');
    expect(viewer).toHaveTextContent('100 %');
    expect(within(viewer).getByRole('button', { name: 'Verkleinern' })).toBeDisabled();

    await userEvent.click(within(viewer).getByRole('button', { name: 'Vergrössern' }));
    expect(viewer).toHaveTextContent('150 %');
    // Antippen des Bildes: gezoomt → ganze Seite, ganze Seite → 200 %
    await userEvent.click(within(viewer).getByRole('img'));
    expect(viewer).toHaveTextContent('100 %');
    await userEvent.click(within(viewer).getByRole('img'));
    expect(viewer).toHaveTextContent('200 %');

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('project windows show the real project image', () => {
    render(<Clipper />);
    const info = screen.getByRole('region', { name: 'Über das Projekt' });
    expect(within(info).getByRole('img', { name: /README des Clippers/ })).toHaveAttribute(
      'src',
      '/media/projects/clipper.webp',
    );
  });
});

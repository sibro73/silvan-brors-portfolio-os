import type { MouseEvent } from 'react';

import { profile } from '../shared/content';
import type { OpenHandler } from './HomeScreen';
import { CodeGlyph, MailGlyph, NotesGlyph, TerminalGlyph } from './icons';
import type { MobileAppId } from './mobileApps';

const github = profile.contact.links.find((l) => l.label === 'GitHub');

export function Dock({ onOpen }: { onOpen: OpenHandler }) {
  const open = (id: MobileAppId) => (e: MouseEvent<HTMLButtonElement>) =>
    onOpen(id, e.currentTarget);
  return (
    <nav aria-label="Dock" className="m-dock m-dockin">
      <button
        type="button"
        className="m-dock__btn m-ic"
        aria-label="Mail: Kontakt"
        onClick={open('kontakt')}
        style={{
          background: 'linear-gradient(160deg, #6A88FF, #3B4FD8)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        <MailGlyph />
      </button>
      <button
        type="button"
        className="m-dock__btn m-ic"
        aria-label="Notizen: Über mich"
        onClick={open('notes')}
        style={{
          background: 'linear-gradient(160deg, #FFDB7A, #F0B429)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        <NotesGlyph />
      </button>
      <button
        type="button"
        className="m-dock__btn m-ic"
        aria-label="Terminal"
        onClick={open('terminal')}
        style={{
          background: 'linear-gradient(160deg, #2E3040, #121318)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        <TerminalGlyph />
      </button>
      <a
        className="m-dock__btn m-ic"
        aria-label="GitHub (öffnet in neuem Tab)"
        href={github?.href ?? 'https://github.com/'}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'linear-gradient(160deg, #FFFFFF, #DCDCE4)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <CodeGlyph />
      </a>
    </nav>
  );
}

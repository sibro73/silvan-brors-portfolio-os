import { useId } from 'react';

import { profile } from '../../shared/content';
import type { MobileAppProps } from '../mobileApps';

const row = {
  padding: '12px 0',
  borderBottom: '1px solid #E5E5EA',
  display: 'flex',
  gap: 6,
} as const;

export function Kontakt({ toast }: MobileAppProps) {
  const id = useId();
  const c = profile.contact;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 15 }}>
      <div style={row}>
        <span className="m-muted">An:</span>
        <span>
          {profile.name} &lt;{c.email}&gt;
        </span>
      </div>
      <div style={row}>
        <span className="m-muted">Betreff:</span>
        <span>{c.subject}</span>
      </div>
      <label htmlFor={id} className="m-visually-hidden">
        Nachricht
      </label>
      <textarea
        id={id}
        placeholder={c.text}
        style={{
          minHeight: 200,
          border: 0,
          padding: '14px 0',
          fontFamily: 'inherit',
          // mindestens 16px, sonst zoomt iOS beim Tippen hinein
          fontSize: 16,
          resize: 'none',
          outline: 'none',
          background: 'transparent',
          color: '#1D1D1F',
        }}
      />
      <button type="button" className="m-primary" onClick={() => toast('Demo: Versand folgt')}>
        Senden
      </button>
      <div
        style={{ display: 'flex', justifyContent: 'center', gap: 24, paddingTop: 18, fontSize: 15 }}
      >
        {c.links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

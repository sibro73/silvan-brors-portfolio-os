import { useId, useState } from 'react';

import { profile } from '../../shared/content';

const row = {
  padding: '12px 0',
  borderBottom: '1px solid #E5E5EA',
  display: 'flex',
  gap: 6,
} as const;

/** «Senden» öffnet das Mailprogramm mit Betreff und Text. */
function mailtoHref(email: string, subject: string, body: string): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body.trim()) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}?${params.join('&')}`;
}

export function Kontakt() {
  const id = useId();
  const c = profile.contact;
  const [message, setMessage] = useState('');
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
        value={message}
        onChange={(e) => setMessage(e.target.value)}
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
      <a
        className="m-primary"
        href={mailtoHref(c.email, c.subject, message)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          textDecoration: 'none',
        }}
      >
        Senden
      </a>
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

import './Mail.css';

import { profile } from '../../data';

export function Mail() {
  const c = profile.contact;
  return (
    <div className="mail">
      <div className="mail__field">
        <span className="mail__key">An:</span>
        <span>
          {profile.name} &lt;{c.email}&gt;
        </span>
      </div>
      <div className="mail__field">
        <span className="mail__key">Betreff:</span>
        <span>{c.subject}</span>
      </div>
      <div className="mail__body">
        <p>{c.text}</p>
        <div className="mail__links">
          {c.links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
      <div className="mail__actions">
        <a
          className="mail__send"
          href={`mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`}
        >
          Senden
        </a>
      </div>
    </div>
  );
}

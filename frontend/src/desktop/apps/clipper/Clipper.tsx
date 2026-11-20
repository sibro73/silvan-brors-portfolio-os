import './Clipper.css';

import { projects } from '../../../data';

export function Clipper() {
  const c = projects.clipper;
  return (
    <div className="tg">
      <div className="tg__header">
        <span aria-hidden="true" className="tg__avatar">
          {c.botInitials}
        </span>
        <div className="tg__who">
          <span className="tg__name">{c.botName}</span>
          <span className="tg__tag">{c.botTag}</span>
        </div>
      </div>
      <ol className="tg__chat" aria-label="Nachrichten">
        <li className="tg__msg tg__msg--in">
          {c.highlight.before}
          <b>{c.highlight.streamer}</b>
          {c.highlight.after}
          <span className="tg__time">{c.highlight.time}</span>
        </li>
        <li className="tg__msg tg__msg--in tg__msg--media">
          <div className="tg__clip mono">{c.clip.label}</div>
          <span className="tg__caption">{c.clip.caption}</span>
        </li>
        <li className="tg__msg tg__msg--out">
          {c.reply.text}
          <span className="tg__time tg__time--out">{c.reply.time}</span>
        </li>
      </ol>
      <p className="tg__footer">{c.footer}</p>
    </div>
  );
}

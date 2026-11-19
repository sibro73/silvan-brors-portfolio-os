import '../simple-note.css';

import { projects } from '../../data';

export function Wetter() {
  const w = projects.wetter;
  return (
    <div className="note">
      <b>{w.title}</b>
      <br />
      {w.description}
      <br />
      <span className="note__muted">{w.placeholder}</span>
    </div>
  );
}

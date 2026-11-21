import '../simple-note.css';

import { projects } from '../../../data';
import { ProjectInfo } from '../ProjectInfo';

export function Wetter() {
  const w = projects.wetter;
  return (
    <div>
      <div className="note">
        <b>{w.title}</b>
        <br />
        <span className="note__muted">{w.placeholder}</span>
      </div>
      <ProjectInfo id="wetter" />
    </div>
  );
}

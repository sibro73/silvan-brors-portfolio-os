import '../pdf-preview.css';
import './Lebenslauf.css';

import { profile } from '../../data';

export function Lebenslauf() {
  return (
    <div className="pdf">
      <article className="pdf__page cv">
        <span className="cv__name">{profile.name}</span>
        <span className="cv__role">{profile.cv.role}</span>
        <hr className="cv__rule" />
        <span className="cv__placeholder mono">{profile.cv.placeholder}</span>
      </article>
      <div className="cv__actions">
        <a className="cv__download" href={profile.cv.downloadHref}>
          {profile.cv.downloadLabel}
        </a>
      </div>
    </div>
  );
}

import '../pdf-preview.css';
import './Lebenslauf.css';

import { profile } from '../../../data';

export function Lebenslauf() {
  return (
    <div className="pdf">
      <article className="pdf__page cv">
        <img className="cv__preview" src={profile.cv.preview} alt={profile.cv.previewAlt} />
      </article>
      <div className="cv__actions">
        <a className="cv__download" href={profile.cv.downloadHref} download>
          {profile.cv.downloadLabel}
        </a>
      </div>
    </div>
  );
}

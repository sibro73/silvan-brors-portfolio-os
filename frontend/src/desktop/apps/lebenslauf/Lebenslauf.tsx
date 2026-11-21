import '../pdf-preview.css';
import './Lebenslauf.css';

import { useState } from 'react';

import { profile } from '../../../data';
import { CvViewer } from '../../../shared/CvViewer';

export function Lebenslauf() {
  const [zoomed, setZoomed] = useState(false);
  return (
    <div className="pdf">
      <article className="pdf__page cv">
        <button
          type="button"
          className="cv__zoom"
          aria-label="Lebenslauf vergrössern"
          onClick={() => setZoomed(true)}
        >
          <img className="cv__preview" src={profile.cv.preview} alt={profile.cv.previewAlt} />
        </button>
      </article>
      <div className="cv__actions">
        <button type="button" className="cv__download" onClick={() => setZoomed(true)}>
          Vergrössern
        </button>
        <a className="cv__download" href={profile.cv.downloadHref} download>
          {profile.cv.downloadLabel}
        </a>
      </div>
      {zoomed && (
        <CvViewer
          src={profile.cv.previewLarge}
          alt={profile.cv.previewAlt}
          pdfHref={profile.cv.downloadHref}
          onClose={() => setZoomed(false)}
        />
      )}
    </div>
  );
}

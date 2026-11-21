import { useState } from 'react';

import { profile } from '../../shared/content';
import { CvViewer } from '../../shared/CvViewer';
import type { MobileAppProps } from '../mobileApps';

export function Cv({ toast }: MobileAppProps) {
  const hasPdf = profile.cv.downloadHref.startsWith('/');
  const [zoomed, setZoomed] = useState(false);
  return (
    <div className="m-stack">
      <div
        className="m-card"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{profile.name}</span>
          <span style={{ fontSize: 14, color: '#6E6E73' }}>{profile.cv.role}</span>
        </div>
        <button
          type="button"
          aria-label="Lebenslauf vergrössern"
          onClick={() => setZoomed(true)}
          style={{ padding: 0, border: 0, background: 'none', cursor: 'zoom-in', display: 'block' }}
        >
          <img
            src={profile.cv.preview}
            alt={profile.cv.previewAlt}
            style={{
              display: 'block',
              width: '100%',
              aspectRatio: '1 / 1.414',
              objectFit: 'contain',
              borderRadius: 10,
              border: '1px solid #E5E5EA',
              background: '#FFFFFF',
            }}
          />
        </button>
        <span style={{ fontSize: 13, color: '#6E6E73', textAlign: 'center' }}>
          Antippen zum Vergrössern
        </span>
      </div>
      {hasPdf ? (
        <a
          className="m-primary"
          href={profile.cv.downloadHref}
          download
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            textDecoration: 'none',
          }}
        >
          {profile.cv.downloadLabel}
        </a>
      ) : (
        <button
          type="button"
          className="m-primary"
          onClick={() => toast('Das PDF wird noch hinterlegt')}
        >
          {profile.cv.downloadLabel}
        </button>
      )}
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

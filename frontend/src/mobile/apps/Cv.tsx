import { profile } from '../../shared/content';
import type { MobileAppProps } from '../mobileApps';

export function Cv({ toast }: MobileAppProps) {
  const hasPdf = profile.cv.downloadHref.startsWith('/');
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
        <div
          className="m-placeholder"
          style={{
            aspectRatio: '1 / 1.2',
            borderRadius: 10,
            border: '1px dashed #C7C7CC',
            color: '#6E6E73',
          }}
        >
          {profile.cv.placeholder}
        </div>
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
    </div>
  );
}

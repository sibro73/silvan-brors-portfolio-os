import type { CSSProperties } from 'react';

import { projects } from '../../shared/content';

const bubble: CSSProperties = {
  alignSelf: 'flex-start',
  maxWidth: '82%',
  background: '#FFFFFF',
  borderRadius: '16px 16px 16px 4px',
  padding: '9px 12px',
  fontSize: 15,
  boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
};

export function Clipper() {
  const c = projects.clipper;
  return (
    <div className="m-stack m-stack--10">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 6 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(160deg, #3FB0F0, #1667B8)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 15,
          }}
          aria-hidden="true"
        >
          {c.botInitials}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <b style={{ fontSize: 15 }}>{c.botName}</b>
          <span style={{ fontSize: 13, color: '#3E6A8A' }}>{c.botTag}</span>
        </span>
      </div>
      <div style={bubble}>
        {c.highlight.before}
        <b>{c.highlight.streamer}</b>
        {c.highlight.after}{' '}
        <span style={{ fontSize: 12, color: '#6E6E73' }}>{c.highlight.time}</span>
      </div>
      <div
        className="m-placeholder"
        style={{
          alignSelf: 'flex-start',
          width: '72%',
          aspectRatio: '9 / 12',
          background: '#1D1D1F',
          borderRadius: 16,
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        {c.clip.label}
      </div>
      <div style={bubble}>{c.clip.caption}</div>
      <div
        style={{
          ...bubble,
          alignSelf: 'flex-end',
          background: '#EFFDDE',
          borderRadius: '16px 16px 4px 16px',
        }}
      >
        {c.reply.text} <span style={{ fontSize: 12, color: '#4F8A3A' }}>{c.reply.time}</span>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#3E6A8A', textAlign: 'center' }}>
        {c.footer}
      </p>
    </div>
  );
}

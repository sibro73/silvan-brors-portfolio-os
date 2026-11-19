import './Notification.css';

import type { ComponentType } from 'react';

import { AppIcon, type GlyphProps } from './AppIcon';

interface NotificationProps {
  title: string;
  text: string;
  icon: { background: string; Glyph: ComponentType<GlyphProps> };
  onOpen: () => void;
  onClose: () => void;
}

export function Notification({ title, text, icon, onOpen, onClose }: NotificationProps) {
  return (
    <div className="notif" role="status">
      <button type="button" className="notif__main" onClick={onOpen}>
        <AppIcon background={icon.background} Glyph={icon.Glyph} size={36} glyphSize={20} />
        <span className="notif__text">
          <b>{title}</b>
          <span>{text}</span>
        </span>
      </button>
      <button
        type="button"
        className="notif__close"
        aria-label="Benachrichtigung schliessen"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

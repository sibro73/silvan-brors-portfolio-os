import type { ComponentType } from 'react';

export interface GlyphProps {
  size?: number;
}

interface AppIconProps {
  background: string;
  Glyph: ComponentType<GlyphProps>;
  /** Kantenlänge in px (Dock/Finder 48, Benachrichtigung 36). */
  size?: number;
  glyphSize?: number;
}

/** Abgerundetes App-Icon wie im Dock. Rein dekorativ. */
export function AppIcon({ background, Glyph, size = 48, glyphSize }: AppIconProps) {
  return (
    <span
      aria-hidden="true"
      className="app-icon"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.23),
        background,
      }}
    >
      <Glyph size={glyphSize} />
    </span>
  );
}

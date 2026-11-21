import type { GlyphProps } from '../../AppIcon';

/** Startseite: das Silvan-OS-Logo (Raute). */
export function Glyph({ size = 30 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5l7.5 8.5-7.5 8.5-7.5-8.5z" fill="#FFFFFF" />
    </svg>
  );
}

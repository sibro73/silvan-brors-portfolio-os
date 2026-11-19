import type { GlyphProps } from '../../os/AppIcon';

export function Glyph({ size = 26 }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E6E6E6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 8l4 4-4 4" />
      <path d="M12 16h6" />
    </svg>
  );
}

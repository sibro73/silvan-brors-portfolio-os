import type { GlyphProps } from '../../AppIcon';

export function Glyph({ size = 26 }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color="#FFFFFF"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      <path d="M9.5 10a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5" />
      <circle cx="12" cy="16.5" r=".6" fill="currentColor" />
    </svg>
  );
}

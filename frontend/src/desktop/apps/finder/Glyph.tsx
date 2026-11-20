import type { GlyphProps } from '../../AppIcon';

export function Glyph({ size = 30 }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#E8F3FF" />
      <path d="M12 2h5a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-5z" fill="#4FA3F7" />
      <circle cx="8" cy="9" r="1.2" fill="#1D1D1F" />
      <circle cx="16" cy="9" r="1.2" fill="#FFFFFF" />
      <path
        d="M7 15c3 2 7 2 10 0"
        stroke="#1D1D1F"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

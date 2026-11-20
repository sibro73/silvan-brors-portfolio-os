/** Glyphen der Handy-Icons aus design/mobile.dc.html (24×24, dekorativ). */
import type { ReactNode } from 'react';

const Svg = ({
  children,
  stroke = '#FFFFFF',
  width = 1.8,
}: {
  children: ReactNode;
  stroke?: string;
  width?: number;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const RtrGlyph = () => (
  <Svg>
    <rect x="4" y="4" width="16" height="16" rx="3" stroke="#F2C14E" />
    <circle cx="9" cy="9" r="1.2" fill="#F2C14E" stroke="none" />
    <circle cx="15" cy="9" r="1.2" fill="#F2C14E" stroke="none" />
    <circle cx="9" cy="15" r="1.2" fill="#F2C14E" stroke="none" />
    <circle cx="15" cy="15" r="1.2" fill="#F2C14E" stroke="none" />
  </Svg>
);

export const ClipperGlyph = ({ width = 1.8 }: { width?: number }) => (
  <Svg width={width}>
    <circle cx="6" cy="7" r="2.5" />
    <circle cx="6" cy="17" r="2.5" />
    <path d="M8.2 8.4L20 18M8.2 15.6L20 6" />
  </Svg>
);

export const IpaGlyph = () => (
  <Svg>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
    <path d="M5 17a3 3 0 0 1 3-3h11" />
  </Svg>
);

export const AgentsGlyph = () => (
  <Svg width={2}>
    <path d="M4 20h16" />
    <path d="M7 16v-4M12 16V7M17 16v-7" />
  </Svg>
);

export const ShopGlyph = () => (
  <Svg>
    <path d="M4 10v10h16V10" />
    <path d="M3 10l2-6h14l2 6z" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);

export const CvGlyph = () => (
  <Svg>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5" />
    <path d="M10 13h6M10 17h6" />
  </Svg>
);

export const SettingsGlyph = () => (
  <Svg>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Svg>
);

export const MailGlyph = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5L12 13l8.5-6.5" />
  </Svg>
);

export const NotesGlyph = () => (
  <Svg stroke="#4A3B00">
    <rect x="5" y="4" width="14" height="16" rx="2" />
    <path d="M8 9h8M8 13h8M8 17h5" />
  </Svg>
);

export const TerminalGlyph = () => (
  <Svg stroke="#7EE787" width={1.9}>
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FFFFFF" />
    <path d="M7 9l3 3-3 3M12 15h5" />
  </Svg>
);

export const CodeGlyph = () => (
  <Svg stroke="#1D1D1F">
    <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
  </Svg>
);

export const SunGlyph = () => (
  <svg
    className="m-sun"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFE08A"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
  </svg>
);

export const BackChevron = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

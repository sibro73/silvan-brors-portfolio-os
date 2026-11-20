import type { DesktopIconKind } from './apps.registry';

interface DesktopIconProps {
  label: string;
  icon: DesktopIconKind;
  onOpen: () => void;
}

function FolderSvg() {
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" aria-hidden="true">
      <path
        d="M2 8a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"
        fill="#4FA3F7"
      />
      <path d="M2 15h52v25a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="#6CB6FA" />
    </svg>
  );
}

function DocumentSvg({ badge, badgeColor }: { badge: string; badgeColor: string }) {
  return (
    <svg width="42" height="52" viewBox="0 0 42 52" aria-hidden="true">
      <path
        d="M2 4a3 3 0 0 1 3-3h22l13 13v34a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z"
        fill="#FFFFFF"
        stroke="#C8C8C8"
      />
      <path d="M27 1v10a3 3 0 0 0 3 3h10" fill="#E9E9E9" stroke="#C8C8C8" />
      <rect x="6" y="32" width="30" height="11" rx="2" fill={badgeColor} />
      <text
        x="21"
        y="40.5"
        textAnchor="middle"
        fontSize="8"
        fontFamily="Inter, sans-serif"
        fontWeight="700"
        fill="#FFFFFF"
      >
        {badge}
      </text>
    </svg>
  );
}

export function DesktopIcon({ label, icon, onOpen }: DesktopIconProps) {
  return (
    <button type="button" className="desktop-icon" onClick={onOpen}>
      {icon.kind === 'folder' ? (
        <FolderSvg />
      ) : (
        <DocumentSvg badge={icon.badge} badgeColor={icon.badgeColor} />
      )}
      <span className="desktop-icon__label">{label}</span>
    </button>
  );
}

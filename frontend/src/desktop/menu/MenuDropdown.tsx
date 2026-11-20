import { type KeyboardEvent, useEffect, useRef } from 'react';

export type ResolvedItem =
  | {
      type: 'item';
      key: string;
      label: string;
      shortcut?: string;
      kind?: 'radio' | 'checkbox';
      checked?: boolean;
      disabled?: boolean;
      onSelect: () => void;
    }
  | { type: 'separator'; key: string };

interface MenuDropdownProps {
  id: string;
  labelledBy: string;
  items: ResolvedItem[];
  /** Beim Öffnen per Tastatur: erstes oder letztes Element fokussieren. */
  initialFocus: 'first' | 'last' | null;
  onClose: (returnFocus: boolean) => void;
  /** Pfeil links/rechts: zum Nachbarmenü. */
  onNeighbour: (direction: -1 | 1) => void;
}

/** Bedienbare Einträge (deaktivierte werden beim Navigieren übersprungen). */
const enabledItems = (list: HTMLElement | null) =>
  Array.from(
    list?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not([aria-disabled="true"])') ??
      [],
  );

const ROLE_BY_KIND = {
  radio: 'menuitemradio',
  checkbox: 'menuitemcheckbox',
} as const;

export function MenuDropdown({
  id,
  labelledBy,
  items,
  initialFocus,
  onClose,
  onNeighbour,
}: MenuDropdownProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!initialFocus) return;
    const all = enabledItems(listRef.current);
    (initialFocus === 'first' ? all[0] : all.at(-1))?.focus();
  }, [initialFocus]);

  const move = (delta: number | 'home' | 'end') => {
    const all = enabledItems(listRef.current);
    if (all.length === 0) return;
    const current = all.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    if (delta === 'home') next = 0;
    else if (delta === 'end') next = all.length - 1;
    else if (current === -1) next = delta > 0 ? 0 : all.length - 1;
    else next = (current + delta + all.length) % all.length;
    all[next].focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Home: () => move('home'),
      End: () => move('end'),
      ArrowRight: () => onNeighbour(1),
      ArrowLeft: () => onNeighbour(-1),
      Escape: () => onClose(true),
      Tab: () => onClose(false),
    };
    const handler = keys[e.key];
    if (!handler) return;
    if (e.key !== 'Tab') e.preventDefault();
    e.stopPropagation();
    handler();
  };

  return (
    <ul
      ref={listRef}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      className="menu"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      {items.map((item) =>
        item.type === 'separator' ? (
          <li key={item.key} role="separator" className="menu__separator" />
        ) : (
          <li key={item.key} role="none">
            <button
              type="button"
              role={item.kind ? ROLE_BY_KIND[item.kind] : 'menuitem'}
              aria-checked={item.kind ? Boolean(item.checked) : undefined}
              aria-disabled={item.disabled || undefined}
              tabIndex={-1}
              className="menu__item"
              onClick={() => {
                if (item.disabled) return;
                onClose(false);
                item.onSelect();
              }}
            >
              <span className="menu__check" aria-hidden="true">
                {item.checked ? '✓' : ''}
              </span>
              <span className="menu__label">{item.label}</span>
              {item.shortcut && (
                <span className="menu__shortcut" aria-hidden="true">
                  {item.shortcut}
                </span>
              )}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}

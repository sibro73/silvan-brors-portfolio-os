import './MenuBar.css';

import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { useStatus } from '../api/statusContext';
import { APPS, type AppId } from '../apps.registry';
import type { OsActions } from './actions';
import { MENUS, type MenuConfig, type MenuContext } from './menu.config';
import { MenuDropdown, type ResolvedItem } from './menu/MenuDropdown';
import {
  BatteryIcon,
  BatteryPanel,
  CalendarPanel,
  WifiIcon,
  WifiPanel,
} from './menu/StatusPopovers';
import { useClock } from './useClock';

interface MenuBarProps {
  activeName: string;
  actions: OsActions;
  context: MenuContext;
  /** Klick auf ein Fenster in der Fensterliste. */
  onSelectWindow: (id: AppId) => void;
}

type Focus = 'first' | 'last' | null;

type PopoverId = 'wifi' | 'battery' | 'clock';

function resolveItems(
  menu: MenuConfig,
  ctx: MenuContext,
  actions: OsActions,
  onSelectWindow: (id: AppId) => void,
): ResolvedItem[] {
  return menu.entries.flatMap((entry, i): ResolvedItem[] => {
    if (entry.type === 'separator') return [{ type: 'separator', key: `sep-${i}` }];
    if (entry.type === 'open-windows') {
      const open = APPS.filter((a) => ctx.state.windows[a.id]);
      if (open.length === 0) {
        return [
          {
            type: 'item',
            key: 'no-windows',
            label: 'Keine Fenster offen',
            disabled: true,
            onSelect: () => {},
          },
        ];
      }
      return open.map((a) => ({
        type: 'item',
        key: `win-${a.id}`,
        label: a.title,
        kind: 'radio',
        checked: ctx.active === a.id,
        onSelect: () => onSelectWindow(a.id),
      }));
    }
    return [
      {
        type: 'item',
        key: entry.action,
        label: entry.label,
        shortcut: entry.shortcut,
        kind: entry.kind,
        checked: entry.checked?.(ctx),
        disabled: entry.disabled?.(ctx),
        onSelect: actions[entry.action],
      },
    ];
  });
}

export function MenuBar({ activeName, actions, context, onSelectWindow }: MenuBarProps) {
  const uid = useId();
  const clock = useClock();
  const { source } = useStatus();
  const rootRef = useRef<HTMLElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const [open, setOpen] = useState<string | null>(null);
  const [initialFocus, setInitialFocus] = useState<Focus>(null);

  const menuIds = MENUS.map((m) => m.id);
  const [focusIndex, setFocusIndex] = useState(0);

  const close = useCallback(
    (returnFocus: boolean) => {
      if (returnFocus && open) triggers.current.get(open)?.focus();
      setOpen(null);
      setInitialFocus(null);
    },
    [open],
  );

  // Klick ausserhalb oder Esc (egal wo der Fokus ist) schliesst Menüs und Popover.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const openMenu = (id: string, focus: Focus) => {
    setOpen(id);
    setInitialFocus(focus);
    const index = menuIds.indexOf(id);
    if (index >= 0) setFocusIndex(index);
  };

  const neighbour = (from: string, direction: -1 | 1) => {
    const index = menuIds.indexOf(from);
    return menuIds[(index + direction + menuIds.length) % menuIds.length];
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const focusTrigger = (target: string) => {
      setFocusIndex(menuIds.indexOf(target));
      triggers.current.get(target)?.focus();
    };
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        e.preventDefault();
        const next = neighbour(id, e.key === 'ArrowRight' ? 1 : -1);
        if (open) openMenu(next, 'first');
        focusTrigger(next);
        break;
      }
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        openMenu(id, 'first');
        break;
      case 'ArrowUp':
        e.preventDefault();
        openMenu(id, 'last');
        break;
      case 'Home':
        e.preventDefault();
        focusTrigger(menuIds[0]);
        break;
      case 'End':
        e.preventDefault();
        focusTrigger(menuIds[menuIds.length - 1]);
        break;
    }
  };

  const togglePopover = (id: PopoverId) => {
    if (open === id) close(false);
    else openMenu(id, null);
  };

  const popover = (id: PopoverId, label: string, icon: ReactNode, panel: ReactNode) => (
    <div className="menubar__status">
      <button
        type="button"
        ref={(el) => {
          if (el) triggers.current.set(id, el);
        }}
        className={`menubar__trigger menubar__status-btn menubar__status-btn--${id}`}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open === id}
        aria-controls={open === id ? `${uid}-${id}` : undefined}
        onClick={() => togglePopover(id)}
      >
        {icon}
      </button>
      {open === id && (
        <div id={`${uid}-${id}`} role="dialog" aria-label={label} className="popover">
          {panel}
        </div>
      )}
    </div>
  );

  const splitAt = clock.lastIndexOf(' ');
  const date = clock.slice(0, splitAt + 1);
  const time = clock.slice(splitAt + 1);

  return (
    <header className="menubar" ref={rootRef}>
      <div role="menubar" aria-label="Menüleiste" className="menubar__left">
        {MENUS.map((menu, i) => {
          const triggerId = `${uid}-trigger-${menu.id}`;
          const isOpen = open === menu.id;
          return (
            <div key={menu.id} className="menubar__menu" role="none">
              <button
                type="button"
                id={triggerId}
                ref={(el) => {
                  if (el) triggers.current.set(menu.id, el);
                }}
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? `${uid}-menu-${menu.id}` : undefined}
                aria-label={menu.logo ? menu.label : undefined}
                tabIndex={i === focusIndex ? 0 : -1}
                className={menu.logo ? 'menubar__trigger menubar__logo' : 'menubar__trigger'}
                onClick={() => (isOpen ? close(false) : openMenu(menu.id, null))}
                onPointerEnter={() => {
                  // Wie macOS: ist ein Menü offen, wechselt Hover zum nächsten.
                  if (open && open !== menu.id && menuIds.includes(open)) openMenu(menu.id, null);
                }}
                onKeyDown={(e) => onTriggerKeyDown(e, menu.id)}
              >
                {menu.logo ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2l9 10-9 10-9-10z" fill="currentColor" />
                  </svg>
                ) : (
                  menu.label
                )}
              </button>
              {isOpen && (
                <MenuDropdown
                  key={menu.id}
                  id={`${uid}-menu-${menu.id}`}
                  labelledBy={triggerId}
                  items={resolveItems(menu, context, actions, onSelectWindow)}
                  initialFocus={initialFocus}
                  onClose={close}
                  onNeighbour={(dir) => {
                    const next = neighbour(menu.id, dir);
                    openMenu(next, 'first');
                    triggers.current.get(next)?.focus();
                  }}
                />
              )}
              {menu.logo && (
                <span className="menubar__app" data-testid="active-app" role="none">
                  {activeName}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="menubar__right">
        {popover(
          'wifi',
          source === 'live' ? 'Verbindung: Backend online' : 'Verbindung: Offline-Modus',
          <WifiIcon offline={source !== 'live'} />,
          <WifiPanel />,
        )}
        {popover(
          'battery',
          'Fortschritt der Lehre',
          <>
            <span className="menubar__battery-text" aria-hidden="true">
              100 %
            </span>
            <BatteryIcon />
          </>,
          <BatteryPanel />,
        )}
        {popover(
          'clock',
          `Kalender, ${clock}`,
          <time className="menubar__clock">
            <span className="menubar__date">{date}</span>
            {time}
          </time>,
          <CalendarPanel />,
        )}
      </div>
    </header>
  );
}

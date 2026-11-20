import { useEffect } from 'react';

import type { ActionId, OsActions } from './actions';

type KeyInfo = Pick<KeyboardEvent, 'code' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>;

/**
 * Tastenkürzel → Aktion.
 * Alt/Option + W/M funktioniert überall. Cmd/Ctrl + W/M wird auch versucht, aber die meisten
 * Browser behalten diese Kombinationen für sich (Tab schliessen, Fenster minimieren).
 * `code` statt `key`, weil Option auf dem Mac sonst Sonderzeichen (∑, µ) liefert.
 */
export function matchShortcut(e: KeyInfo): ActionId | null {
  if (e.shiftKey) return null;
  const alt = e.altKey && !e.ctrlKey && !e.metaKey;
  const cmd = (e.ctrlKey || e.metaKey) && !e.altKey;
  if (!alt && !cmd) return null;
  if (e.code === 'KeyW') return 'close-window';
  if (e.code === 'KeyM') return 'minimize-window';
  return null;
}

/** Tippt jemand gerade (Terminal, Formular)? Dann keine Kürzel abfangen. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.closest('[contenteditable=""], [contenteditable="true"]'))
    return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function useShortcuts(actions: OsActions, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isEditableTarget(e.target)) return;
      const action = matchShortcut(e);
      if (!action) return;
      e.preventDefault();
      actions[action]();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions, enabled]);
}

/** Für das Fenster «Tastenkürzel». */
export const SHORTCUT_LIST: { keys: string; label: string }[] = [
  { keys: '⌥ W  ·  Alt+W', label: 'Aktives Fenster schliessen' },
  { keys: '⌥ M  ·  Alt+M', label: 'Aktives Fenster minimieren' },
  { keys: 'Esc', label: 'Menü oder Popover schliessen' },
  { keys: '← →', label: 'In der Menüleiste zwischen Menüs wechseln' },
  { keys: '↑ ↓', label: 'Im Menü navigieren, im Terminal durch den Verlauf' },
  { keys: 'Enter', label: 'Menüeintrag wählen, Terminal-Befehl ausführen' },
  { keys: 'Tab', label: 'Zum nächsten Bedienelement' },
];

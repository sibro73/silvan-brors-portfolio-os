import { describe, expect, it } from 'vitest';

import { isEditableTarget, matchShortcut } from './shortcuts';

const key = (code: string, mods: Partial<Record<'alt' | 'ctrl' | 'meta' | 'shift', boolean>>) => ({
  code,
  altKey: Boolean(mods.alt),
  ctrlKey: Boolean(mods.ctrl),
  metaKey: Boolean(mods.meta),
  shiftKey: Boolean(mods.shift),
});

describe('matchShortcut', () => {
  it('Alt/Option + W/M', () => {
    expect(matchShortcut(key('KeyW', { alt: true }))).toBe('close-window');
    expect(matchShortcut(key('KeyM', { alt: true }))).toBe('minimize-window');
  });

  it('Cmd/Ctrl + W/M (if the browser lets them through)', () => {
    expect(matchShortcut(key('KeyW', { ctrl: true }))).toBe('close-window');
    expect(matchShortcut(key('KeyM', { meta: true }))).toBe('minimize-window');
  });

  it('ignores other combinations', () => {
    expect(matchShortcut(key('KeyW', {}))).toBeNull();
    expect(matchShortcut(key('KeyW', { alt: true, shift: true }))).toBeNull();
    expect(matchShortcut(key('KeyW', { alt: true, ctrl: true }))).toBeNull();
    expect(matchShortcut(key('KeyQ', { alt: true }))).toBeNull();
  });
});

describe('isEditableTarget', () => {
  it('detects text inputs', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    expect(isEditableTarget(div)).toBe(true);
    expect(isEditableTarget(document.createElement('button'))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

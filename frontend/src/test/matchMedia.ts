import { vi } from 'vitest';

/** Simuliert window.matchMedia für eine bestimmte Fensterbreite. */
export function mockViewportWidth(width: number) {
  const listeners = new Set<() => void>();
  const matches = (query: string) => {
    const max = /max-width:\s*([\d.]+)px/.exec(query);
    return max ? width <= Number(max[1]) : false;
  };
  window.matchMedia = vi.fn((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  return {
    resize(next: number) {
      width = next;
      listeners.forEach((cb) => cb());
    },
  };
}

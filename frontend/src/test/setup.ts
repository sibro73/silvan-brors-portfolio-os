import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom kennt kein Scrollen. (Server-Tests laufen ohne window.)
if (typeof window !== 'undefined') window.scrollTo = () => {};

afterEach(() => {
  cleanup();
});

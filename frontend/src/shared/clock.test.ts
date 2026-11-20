import { describe, expect, it } from 'vitest';

import { formatClock } from './clock';

describe('formatClock', () => {
  it('shows Zurich time in winter (UTC+1)', () => {
    const c = formatClock(new Date('2026-11-19T13:05:00Z'));
    expect(c).toMatch(/19\. Nov/);
    expect(c.endsWith('14:05')).toBe(true);
  });

  it('shows Zurich time in summer (UTC+2)', () => {
    const c = formatClock(new Date('2026-07-01T22:30:00Z'));
    expect(c).toMatch(/2\. Juli?/);
    expect(c.endsWith('00:30')).toBe(true);
  });
});

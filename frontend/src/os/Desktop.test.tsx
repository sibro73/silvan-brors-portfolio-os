import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Desktop } from './Desktop';

describe('Desktop', () => {
  it('shows the four desktop icons in reference order', () => {
    render(<Desktop narrow={false} onOpen={() => {}} />);
    const labels = screen
      .getAllByRole('button')
      .map((b) => b.querySelector('.desktop-icon__label')?.textContent);
    expect(labels).toEqual(['Projekte', 'Lebenslauf.pdf', 'Über mich.txt', 'Kontakt']);
  });

  it('opens the matching app on click', async () => {
    const onOpen = vi.fn();
    render(<Desktop narrow={false} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('button', { name: 'Lebenslauf.pdf' }));
    expect(onOpen).toHaveBeenCalledWith('cv');
  });
});

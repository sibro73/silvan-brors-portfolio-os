import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { APP_BY_ID } from '../apps.registry';
import { Window } from './Window';
import type { WindowActions, WindowState } from './windowStore';

const mockActions = (): WindowActions => ({
  open: vi.fn(),
  close: vi.fn(),
  focus: vi.fn(),
  minimize: vi.fn(),
  toggleMaximize: vi.fn(),
  move: vi.fn(),
});

const base: WindowState = { x: 90, y: 40, z: 3, minimized: false, maximized: false };

function setup(state: Partial<WindowState> = {}, narrow = false) {
  const actions = mockActions();
  render(
    <Window
      app={APP_BY_ID.about}
      state={{ ...base, ...state }}
      active
      narrow={narrow}
      actions={actions}
    >
      <p>Inhalt</p>
    </Window>,
  );
  return actions;
}

describe('Window', () => {
  it('renders as a labelled region with title and content', () => {
    setup();
    const win = screen.getByRole('region', { name: 'Über mich.txt' });
    expect(win).toHaveTextContent('Inhalt');
    expect(win).toHaveStyle({ left: '90px', top: '40px', width: '500px' });
  });

  it('wires the traffic-light buttons', async () => {
    const actions = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Fenster schliessen' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fenster minimieren' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fenster maximieren' }));
    expect(actions.close).toHaveBeenCalledWith('about');
    expect(actions.minimize).toHaveBeenCalledWith('about');
    expect(actions.toggleMaximize).toHaveBeenCalledWith('about');
  });

  it('focuses on pointer down', () => {
    const actions = setup();
    fireEvent.pointerDown(screen.getByText('Inhalt'));
    expect(actions.focus).toHaveBeenCalledWith('about');
  });

  it('drags by the title bar', () => {
    const actions = setup();
    const bar = screen.getByTestId('titlebar');
    fireEvent.pointerDown(bar, { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(bar, { pointerId: 1, clientX: 130, clientY: 80 });
    fireEvent.pointerUp(bar, { pointerId: 1 });
    fireEvent.pointerMove(bar, { pointerId: 1, clientX: 500, clientY: 500 });
    expect(actions.move).toHaveBeenCalledTimes(1);
    expect(actions.move).toHaveBeenCalledWith('about', 120, 20, 500);
  });

  it('does not drag when maximized', () => {
    const actions = setup({ maximized: true });
    const bar = screen.getByTestId('titlebar');
    fireEvent.pointerDown(bar, { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(bar, { pointerId: 1, clientX: 130, clientY: 80 });
    expect(actions.move).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Fenstergrösse wiederherstellen' })).toBeVisible();
  });

  it('stacks without drag or maximize in narrow mode', () => {
    const actions = setup({}, true);
    const bar = screen.getByTestId('titlebar');
    fireEvent.pointerDown(bar, { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(bar, { pointerId: 1, clientX: 130, clientY: 80 });
    expect(actions.move).not.toHaveBeenCalled();
    expect(screen.getByRole('region')).toHaveStyle({ position: 'relative', width: '100%' });
    expect(screen.getByRole('button', { name: 'Fenster maximieren' })).toBeDisabled();
  });

  it('hides minimized windows but keeps them mounted', () => {
    setup({ minimized: true });
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.getByText('Inhalt', { selector: 'p' })).not.toBeVisible();
  });
});

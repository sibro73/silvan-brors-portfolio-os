import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OPEN_DELAY_MS, Terminal } from './Terminal';

function setup() {
  const openApp = vi.fn();
  const closeSelf = vi.fn();
  render(<Terminal openApp={openApp} closeSelf={closeSelf} />);
  const input = screen.getByLabelText('Befehl eingeben');
  const log = screen.getByRole('log');
  return { openApp, closeSelf, input, log };
}

describe('Terminal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('greets with last login and a hint', () => {
    const { log } = setup();
    expect(log).toHaveTextContent(/^Last login: .+ on ttys000/);
    expect(log).toHaveTextContent('Tippe «help», um alle Befehle zu sehen.');
  });

  it('echoes the command and prints the output', async () => {
    const { input, log } = setup();
    await userEvent.type(input, 'whoami{Enter}');
    expect(log).toHaveTextContent('silvan@macbook ~ % whoami');
    expect(log).toHaveTextContent('silvan brors');
    expect(input).toHaveValue('');
  });

  it('recalls previous commands with arrow up and down', async () => {
    const { input } = setup();
    await userEvent.type(input, 'help{Enter}');
    await userEvent.type(input, 'motto{Enter}');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('motto');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('help');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('help');
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveValue('motto');
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveValue('');
  });

  it('clear empties the output', async () => {
    const { input, log } = setup();
    await userEvent.type(input, 'clear{Enter}');
    expect(log).toBeEmptyDOMElement();
  });

  it('exit closes the window', async () => {
    const { input, closeSelf } = setup();
    await userEvent.type(input, 'exit{Enter}');
    expect(closeSelf).toHaveBeenCalledOnce();
  });

  it('open launches the app after a short delay', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, log, openApp } = setup();
    await user.type(input, 'open ipa{Enter}');
    expect(log).toHaveTextContent('öffne ipa …');
    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS);
    });
    expect(openApp).toHaveBeenCalledWith('ipa');
  });

  it('focuses the input when clicking into the terminal', async () => {
    const { input, log } = setup();
    await userEvent.click(log);
    expect(input).toHaveFocus();
  });
});

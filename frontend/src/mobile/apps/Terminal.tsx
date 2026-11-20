import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { useStatus } from '../../api/statusContext';
import { TERMINAL_CHIPS } from '../../shared/content';
import { type Line, pushHistory, runCommand, stepHistory, type Tone } from '../../shared/terminal';
import { MOBILE_OPEN_ALIASES, type MobileAppProps } from '../mobileApps';

const COLORS: Record<Tone, string> = {
  default: '#E6E6E6',
  green: '#7EE787',
  red: '#FF7B72',
  muted: '#9A9A9A',
};
const MAX_LINES = 30;
/** Kurze Pause, damit man «öffne …» noch liest. */
export const OPEN_DELAY_MS = 350;

const WELCOME: Line[] = [
  { text: 'silvan os · mobile', tone: 'muted' },
  { text: 'Tippe «help» oder einen Befehl unten.', tone: 'default' },
];

export function Terminal({ open, goHome }: MobileAppProps) {
  const { status, source } = useStatus();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef(0);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputId = useId();

  useEffect(() => () => clearTimeout(openTimer.current), []);

  function run(raw: string) {
    const nextHistory = pushHistory(history, raw);
    setHistory(nextHistory);
    historyIndex.current = nextHistory.length;
    setCmd('');
    const { lines: output, effect } = runCommand(raw, {
      status,
      offline: source === 'fallback',
      aliases: MOBILE_OPEN_ALIASES,
    });
    if (effect?.type === 'clear') {
      setLines([]);
      return;
    }
    if (effect?.type === 'exit') {
      goHome();
      return;
    }
    if (effect?.type === 'open') {
      const id = effect.id;
      clearTimeout(openTimer.current);
      openTimer.current = setTimeout(() => open(id), OPEN_DELAY_MS);
    }
    const echo: Line = { text: `~ % ${raw.trim()}`, tone: 'default' };
    setLines((prev) => [...prev, echo, ...output].slice(-MAX_LINES));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(cmd);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const step = stepHistory(history, historyIndex.current, e.key === 'ArrowUp' ? 'up' : 'down');
      if (!step) return;
      e.preventDefault();
      historyIndex.current = step.index;
      setCmd(step.value);
    }
  }

  return (
    <div
      className="m-fill"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }} aria-live="polite">
        {lines.map((l, i) => (
          <div
            key={i}
            className="m-ln"
            style={{ color: COLORS[l.tone], whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {l.text}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#E6E6E6' }}>
          <label htmlFor={inputId} style={{ whiteSpace: 'nowrap', color: '#7EE787' }}>
            ~ %<span className="m-visually-hidden"> Befehl</span>
          </label>
          <input
            id={inputId}
            type="text"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="send"
            placeholder="Befehl eingeben"
            style={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: 'none',
              background: 'transparent',
              color: '#FFFFFF',
              fontFamily: 'inherit',
              // mindestens 16px, sonst zoomt iOS beim Tippen hinein
              fontSize: 16,
              padding: '6px 0',
              minHeight: 44,
            }}
          />
        </div>
      </div>
      <div className="m-chips">
        {TERMINAL_CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className="m-chip"
            onClick={() => run(c)}
            style={{
              border: '1px solid #3A3A3C',
              background: '#2A2A2C',
              color: '#E6E6E6',
              borderRadius: 10,
              padding: '0 12px',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 400,
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

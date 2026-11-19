import './Terminal.css';

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import type { AppProps } from '../../os/appTypes';
import { formatLastLogin } from '../../os/clock';
import { type Line, OUTPUT_LIMIT, PROMPT, pushHistory, runCommand, stepHistory } from './commands';

/** Verzögerung, damit «öffne …» kurz sichtbar ist, bevor das Fenster aufgeht. */
export const OPEN_DELAY_MS = 150;

const initialLines = (): Line[] => [
  { text: `Last login: ${formatLastLogin(new Date())} on ttys000`, tone: 'muted' },
  { text: 'Tippe «help», um alle Befehle zu sehen.', tone: 'default' },
];

export function Terminal({ openApp, closeSelf }: AppProps) {
  const inputId = useId();
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Immer die letzte Zeile zeigen.
  useEffect(() => {
    const scroller = endRef.current?.closest('.win__body');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [lines]);

  const submit = () => {
    const raw = input;
    const nextHistory = pushHistory(history, raw);
    setHistory(nextHistory);
    historyIndex.current = nextHistory.length;
    setInput('');

    const { lines: output, effect } = runCommand(raw);
    if (effect?.type === 'clear') {
      setLines([]);
      return;
    }
    if (effect?.type === 'exit') {
      closeSelf();
      return;
    }
    const echo: Line = { text: `${PROMPT} ${raw.trim()}`, tone: 'default' };
    setLines((prev) => [...prev, echo, ...output].slice(-OUTPUT_LIMIT));
    if (effect?.type === 'open') {
      const id = effect.id;
      timers.current.push(setTimeout(() => openApp(id), OPEN_DELAY_MS));
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const step = stepHistory(history, historyIndex.current, e.key === 'ArrowUp' ? 'up' : 'down');
      if (!step) return;
      e.preventDefault();
      historyIndex.current = step.index;
      setInput(step.value);
    }
  };

  return (
    // Klick irgendwo ins Terminal setzt den Cursor ins Eingabefeld (Komfort; per Tastatur ist das Feld direkt erreichbar).
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div role="log" aria-label="Terminal-Ausgabe" className="term__log">
        {lines.map((l, i) => (
          <div key={i} className={`term__line term__line--${l.tone}`}>
            {l.text}
          </div>
        ))}
      </div>
      <div className="term__prompt" ref={endRef}>
        <span className="term__ps1">{PROMPT}</span>
        <label htmlFor={inputId} className="visually-hidden">
          Befehl eingeben
        </label>
        <input
          id={inputId}
          ref={inputRef}
          className="term__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

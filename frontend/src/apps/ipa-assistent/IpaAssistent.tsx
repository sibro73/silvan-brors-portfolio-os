import './IpaAssistent.css';

import { type FormEvent, useId, useRef, useState } from 'react';

import { askIpa, IPA_LIVE, type IpaResult, type IpaSource } from '../../api/ipa';
import { ipa } from '../../data';
import type { AppProps } from '../../os/appTypes';

const MAX_LENGTH = 300;

type Entry =
  | { id: number; kind: 'example'; index: number }
  | { id: number; kind: 'live'; question: string; result: IpaResult | null };

interface IpaAssistentProps extends Partial<AppProps> {
  /** Für Tests austauschbar. */
  ask?: (question: string) => Promise<IpaResult>;
  /** Eingabefeld für echte Fragen zeigen (nur lokal). */
  live?: boolean;
}

function Sources({ sources }: { sources: IpaSource[] }) {
  if (sources.length === 0) return null;
  return (
    <span className="ipa__source mono">
      Quelle{sources.length > 1 ? 'n' : ''}:{' '}
      {sources.map((s) => `${s.datei} › ${s.abschnitt}`).join(' · ')}
    </span>
  );
}

export function IpaAssistent({ ask = askIpa, live = IPA_LIVE }: IpaAssistentProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState('');
  const nextId = useRef(1);
  const inputId = useId();

  const pending = entries.some((e) => e.kind === 'live' && e.result === null);
  const last = entries.at(-1);
  const activeExample = last?.kind === 'example' ? last.index : null;
  const question = draft.trim();

  function showExample(index: number) {
    setEntries((prev) => [...prev, { id: nextId.current++, kind: 'example', index }]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || question.length < 3) return;
    const id = nextId.current++;
    setEntries((prev) => [...prev, { id, kind: 'live', question, result: null }]);
    setDraft('');
    const result = await ask(question);
    setEntries((prev) =>
      prev.map((e) => (e.id === id && e.kind === 'live' ? { ...e, result } : e)),
    );
  }

  return (
    <div className="ipa">
      <div className="ipa__chat" aria-live="polite">
        <div className="ipa__bubble">{ipa.greeting}</div>
        {entries.map((entry) => {
          if (entry.kind === 'example') {
            const qa = ipa.examples[entry.index];
            return (
              <div key={entry.id} className="ipa__exchange">
                <div className="ipa__bubble ipa__bubble--user ln">{qa.question}</div>
                <div className="ipa__bubble ipa__bubble--answer ln ln--delayed">
                  {qa.answer}
                  <span className="ipa__source mono">
                    {ipa.exampleLabel} · Quelle: {qa.source}
                  </span>
                </div>
              </div>
            );
          }
          const { result } = entry;
          return (
            <div key={entry.id} className="ipa__exchange">
              <div className="ipa__bubble ipa__bubble--user ln">{entry.question}</div>
              {result === null ? (
                <div className="ipa__bubble ipa__bubble--pending">{ipa.thinking}</div>
              ) : result.ok ? (
                <div className="ipa__bubble ipa__bubble--answer ln">
                  {result.answer}
                  <Sources sources={result.sources} />
                </div>
              ) : (
                <div className="ipa__bubble ipa__bubble--error ln" role="status">
                  {result.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="ipa__questions">
        {ipa.examples.map((ex, i) => (
          <button
            key={ex.question}
            type="button"
            className="ipa__chip"
            aria-pressed={activeExample === i}
            onClick={() => showExample(i)}
          >
            {ex.question}
          </button>
        ))}
      </div>
      {live && (
        <form className="ipa__form" onSubmit={submit}>
          <label htmlFor={inputId} className="visually-hidden">
            {ipa.inputLabel}
          </label>
          <input
            id={inputId}
            className="ipa__input"
            type="text"
            value={draft}
            maxLength={MAX_LENGTH}
            placeholder={ipa.placeholder}
            autoComplete="off"
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="submit"
            className="ipa__send"
            disabled={pending || question.length < 3}
            aria-busy={pending}
          >
            Fragen
          </button>
        </form>
      )}
      <p className="ipa__footer mono">
        {ipa.footer}
        {!live && ` · ${ipa.exampleNote}`}
      </p>
    </div>
  );
}

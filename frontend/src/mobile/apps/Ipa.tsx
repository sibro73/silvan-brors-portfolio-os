import { type CSSProperties, type FormEvent, useEffect, useId, useRef, useState } from 'react';

import { askIpa, IPA_AGENT, IPA_LIVE, type IpaResult } from '../../api/ipa';
import { ipa } from '../../shared/content';
import type { MobileAppProps } from '../mobileApps';

/** Wie im Design: Beispielantworten erscheinen nach kurzem «schreibt …». */
export const EXAMPLE_TYPING_MS = 900;
const MAX_LENGTH = 300;

const incoming: CSSProperties = {
  alignSelf: 'flex-start',
  maxWidth: '85%',
  background: '#E9E9EB',
  borderRadius: '18px 18px 18px 4px',
  padding: '10px 14px',
  fontSize: 15,
};
const outgoing: CSSProperties = {
  alignSelf: 'flex-end',
  maxWidth: '85%',
  background: 'linear-gradient(160deg, #8466F0, #4A2FB0)',
  color: '#FFFFFF',
  borderRadius: '18px 18px 4px 18px',
  padding: '10px 14px',
  fontSize: 15,
};

type Entry =
  | { id: number; kind: 'example'; index: number; typing: boolean }
  | { id: number; kind: 'live'; question: string; result: IpaResult | null };

interface IpaProps extends Partial<MobileAppProps> {
  /** Für Tests austauschbar. */
  ask?: (question: string) => Promise<IpaResult>;
  live?: boolean;
  agent?: boolean;
}

function Typing() {
  return (
    <div
      className="m-ln"
      role="status"
      aria-label="schreibt"
      style={{ ...incoming, padding: '13px 16px', display: 'flex', gap: 5 }}
    >
      <span className="m-dot" />
      <span className="m-dot" />
      <span className="m-dot" />
    </div>
  );
}

export function Ipa({ ask = askIpa, live = IPA_LIVE, agent = IPA_AGENT }: IpaProps) {
  const canAsk = live || agent;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState('');
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const inputId = useId();
  const question = draft.trim();
  const pending = entries.some((e) => e.kind === 'live' && e.result === null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function showExample(index: number) {
    const id = nextId.current++;
    setEntries((prev) => [...prev, { id, kind: 'example', index, typing: true }]);
    timers.current.push(
      setTimeout(() => {
        setEntries((prev) =>
          prev.map((e) => (e.id === id && e.kind === 'example' ? { ...e, typing: false } : e)),
        );
      }, EXAMPLE_TYPING_MS),
    );
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

  const footer = agent
    ? ipa.agentFooter
    : canAsk
      ? ipa.footer
      : `${ipa.footer} · ${ipa.exampleNote}`;

  return (
    <div className="m-fill" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={incoming}>{agent ? ipa.agentGreeting : ipa.greeting}</div>
      <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map((entry) => {
          if (entry.kind === 'example') {
            const qa = ipa.examples[entry.index];
            return (
              <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="m-ln" style={outgoing}>
                  {qa.question}
                </div>
                {entry.typing ? (
                  <Typing />
                ) : (
                  <div
                    className="m-ln"
                    style={{ ...incoming, display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    <span>{qa.answer}</span>
                    <span style={{ fontSize: 12, color: '#5E5E63' }}>
                      {ipa.exampleLabel} · Quelle: {qa.source}
                    </span>
                  </div>
                )}
              </div>
            );
          }
          const { result } = entry;
          return (
            <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="m-ln" style={outgoing}>
                {entry.question}
              </div>
              {result === null ? (
                <Typing />
              ) : result.ok ? (
                <div
                  className="m-ln"
                  style={{ ...incoming, display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  <span>{result.answer}</span>
                  {result.sources.length > 0 ? (
                    <span style={{ fontSize: 12, color: '#5E5E63' }}>
                      Quelle{result.sources.length > 1 ? 'n' : ''}:{' '}
                      {result.sources.map((s) => `${s.datei} › ${s.abschnitt}`).join(' · ')}
                    </span>
                  ) : (
                    result.note && (
                      <span style={{ fontSize: 12, color: '#5E5E63' }}>{result.note}</span>
                    )
                  )}
                </div>
              ) : (
                <div className="m-ln" role="alert" style={{ ...incoming, color: '#B3122B' }}>
                  {result.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <div className="m-chips" style={{ paddingTop: 12 }}>
        {ipa.examples.map((ex, i) => (
          <button
            key={ex.question}
            type="button"
            className="m-chip"
            onClick={() => showExample(i)}
            style={{ border: '1px solid #5B3CC4', background: '#FFFFFF', color: '#4A2FB0' }}
          >
            {ex.question}
          </button>
        ))}
      </div>
      {canAsk && (
        <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
          <label htmlFor={inputId} className="m-visually-hidden">
            {ipa.inputLabel}
          </label>
          <input
            id={inputId}
            type="text"
            value={draft}
            maxLength={MAX_LENGTH}
            placeholder={ipa.placeholder}
            autoComplete="off"
            enterKeyHint="send"
            onChange={(e) => setDraft(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 44,
              border: '1px solid #D1D1D6',
              borderRadius: 999,
              padding: '0 16px',
              fontFamily: 'inherit',
              // mindestens 16px, sonst zoomt iOS beim Tippen hinein
              fontSize: 16,
              color: '#1D1D1F',
              background: '#FFFFFF',
            }}
          />
          <button
            type="submit"
            disabled={pending || question.length < 3}
            aria-busy={pending}
            style={{
              minHeight: 44,
              border: 0,
              borderRadius: 999,
              padding: '0 16px',
              background: 'linear-gradient(160deg, #8466F0, #4A2FB0)',
              color: '#FFFFFF',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: pending || question.length < 3 ? 0.5 : 1,
            }}
          >
            Fragen
          </button>
        </form>
      )}
      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6E6E73', textAlign: 'center' }}>
        {footer}
      </p>
    </div>
  );
}

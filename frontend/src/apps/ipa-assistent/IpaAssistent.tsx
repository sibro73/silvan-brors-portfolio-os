import './IpaAssistent.css';

import { useState } from 'react';

import { ipa } from '../../data';

export function IpaAssistent() {
  const [current, setCurrent] = useState<number | null>(null);
  const qa = current === null ? null : ipa.examples[current];

  return (
    <div className="ipa">
      <div className="ipa__chat" aria-live="polite">
        <div className="ipa__bubble">{ipa.greeting}</div>
        {qa && (
          // key: bei jeder neuen Frage die Einblend-Animation neu starten
          <div key={current} className="ipa__exchange">
            <div className="ipa__bubble ipa__bubble--user ln">{qa.question}</div>
            <div className="ipa__bubble ipa__bubble--answer ln ln--delayed">
              {qa.answer}
              <span className="ipa__source mono">Quelle: {qa.source}</span>
            </div>
          </div>
        )}
      </div>
      <div className="ipa__questions">
        {ipa.examples.map((ex, i) => (
          <button
            key={ex.question}
            type="button"
            className="ipa__chip"
            aria-pressed={current === i}
            onClick={() => setCurrent(i)}
          >
            {ex.question}
          </button>
        ))}
      </div>
      <p className="ipa__footer mono">{ipa.footer}</p>
    </div>
  );
}

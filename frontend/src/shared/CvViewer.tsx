import './cv-viewer.css';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Zoomstufen relativ zur Breite des Bildschirms (1 = ganze Seite sichtbar in der Breite). */
const ZOOM_STEPS = [1, 1.5, 2, 3];

interface CvViewerProps {
  src: string;
  alt: string;
  pdfHref: string;
  onClose: () => void;
}

/**
 * Grossansicht des Lebenslaufs über der ganzen Seite: Antippen oder +/− zoomt, scrollen in
 * beide Richtungen, Esc oder ✕ schliesst. Am Handy geht zusätzlich das normale Zoomen mit zwei Fingern.
 */
export function CvViewer({ src, alt, pdfHref, onClose }: CvViewerProps) {
  const [step, setStep] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const zoom = ZOOM_STEPS[step];

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setStep((s) => Math.min(ZOOM_STEPS.length - 1, s + 1));
      } else if (e.key === '-') {
        setStep((s) => Math.max(0, s - 1));
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      previous?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="cvv" role="dialog" aria-modal="true" aria-label="Lebenslauf gross ansehen">
      <div className="cvv__bar">
        <button
          type="button"
          className="cvv__btn"
          aria-label="Verkleinern"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          −
        </button>
        <span className="cvv__zoom" aria-live="polite">
          {Math.round(zoom * 100)} %
        </span>
        <button
          type="button"
          className="cvv__btn"
          aria-label="Vergrössern"
          disabled={step === ZOOM_STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(ZOOM_STEPS.length - 1, s + 1))}
        >
          +
        </button>
        <a className="cvv__link" href={pdfHref} target="_blank" rel="noopener noreferrer">
          PDF öffnen ↗
        </a>
        <button
          ref={closeRef}
          type="button"
          className="cvv__btn cvv__close"
          aria-label="Schliessen"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="cvv__scroll">
        <div className="cvv__page">
          <button
            type="button"
            className="cvv__toggle"
            aria-label={zoom > 1 ? 'Ganze Seite zeigen' : 'Auf 200 % vergrössern'}
            onClick={() => setStep((s) => (s === 0 ? 2 : 0))}
            style={{ width: `${zoom * 100}%` }}
          >
            <img
              className={zoom > 1 ? 'cvv__img cvv__img--zoomed' : 'cvv__img'}
              src={src}
              alt={alt}
            />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

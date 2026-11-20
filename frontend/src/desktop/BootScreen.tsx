import './BootScreen.css';

/** Schwarzer Bildschirm mit Logo und Ladebalken während «Neu starten». */
export function BootScreen() {
  return (
    <div className="boot" role="status" aria-label="Silvan OS startet neu">
      <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l9 10-9 10-9-10z" fill="#ffffff" />
      </svg>
      <span className="boot__track" aria-hidden="true">
        <span className="boot__bar" />
      </span>
    </div>
  );
}

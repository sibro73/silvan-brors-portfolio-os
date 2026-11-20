import type { AppId } from './apps.registry';

/** Befehl, den das Terminal ausführen soll (z. B. aus «Hilfe → Terminal-Befehle»). */
export interface TerminalRequest {
  /** Fortlaufend, damit derselbe Befehl zweimal hintereinander ausgelöst werden kann. */
  nonce: number;
  command: string;
  /** Meldet, dass der Befehl ausgeführt wurde (sonst liefe er beim nächsten Öffnen erneut). */
  onHandled: (nonce: number) => void;
}

/** Props, die jede App (Inhalt eines Fensters) bekommt. */
export interface AppProps {
  openApp: (id: AppId) => void;
  closeSelf: () => void;
  /** Nur für das Terminal. */
  terminalRequest?: TerminalRequest;
}

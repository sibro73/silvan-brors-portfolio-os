import type { AppId } from '../apps.registry';

/** Props, die jede App (Inhalt eines Fensters) bekommt. */
export interface AppProps {
  openApp: (id: AppId) => void;
  closeSelf: () => void;
}

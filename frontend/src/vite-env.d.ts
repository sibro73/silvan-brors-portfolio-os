/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Basis-URL des Backends, z. B. https://api.silvanbrors.ch. Leer = kein Backend. */
  readonly VITE_API_URL?: string;
  /** `true`: IPA-Chat mit Eingabefeld (nur lokal, ipa-assistant ist nicht öffentlich). */
  readonly VITE_IPA_LIVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Version aus package.json (vite.config.ts → define). */
declare const __APP_VERSION__: string;

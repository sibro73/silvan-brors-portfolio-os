/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Basis-URL des Backends. `/` = gleiche Domain (Pages Functions). Leer = kein Backend. */
  readonly VITE_API_URL?: string;
  /** `true`: IPA-Chat mit Eingabefeld (nur lokal, ipa-assistant ist nicht öffentlich). */
  readonly VITE_IPA_LIVE?: string;
  /** `true`: IPA-Chat mit Eingabefeld und RAG auf Cloudflare (Live-Seite, Pages Function). */
  readonly VITE_IPA_AGENT?: string;
  /** Ziel für IPA-Fragen. `/` = gleiche Domain (Pages Function). Leer = `VITE_API_URL`. */
  readonly VITE_IPA_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Version aus package.json (vite.config.ts → define). */
declare const __APP_VERSION__: string;

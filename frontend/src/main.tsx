// Nur der Latin-Zeichensatz (enthält ä/ö/ü, Anführungszeichen, «» und –):
// kleineres CSS, keine Schriftdateien für Kyrillisch, Griechisch, Vietnamesisch.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { StatusProvider } from './api/StatusProvider';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StatusProvider>
      <App />
    </StatusProvider>
  </StrictMode>,
);

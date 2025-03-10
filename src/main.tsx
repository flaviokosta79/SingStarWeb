import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Choose one import style - using named import
import { DebugPanel } from './components/DebugPanel';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <DebugPanel />
  </StrictMode>
);

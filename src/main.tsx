import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Enable React concurrent features
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
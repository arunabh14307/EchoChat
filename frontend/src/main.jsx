import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Ensure index.html has <div id="root"></div>');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

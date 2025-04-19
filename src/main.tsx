import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // <-- Import createRoot

import './index.css';
import { App } from './components/App.tsx';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container); // <-- Create a root
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

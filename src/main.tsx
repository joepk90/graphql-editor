import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // <-- Import createRoot

import './index.css';
import { App } from './components/App.tsx';
import { SchemaProvider } from './contexts/SchemaContext.tsx';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container); // <-- Create a root
  root.render(
    <StrictMode>
      <SchemaProvider>
        <App />
      </SchemaProvider>
    </StrictMode>,
  );
}

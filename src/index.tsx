import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // <-- Import createRoot

import { App } from 'src/components/App';
import 'src/index.css';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container); // <-- Create a root
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

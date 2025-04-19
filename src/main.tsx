import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './components/App.tsx';
import 'graphiql/graphiql.css';

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root'),
);

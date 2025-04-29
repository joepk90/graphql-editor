import { Dashboard } from 'src/components/Dashboard.tsx';
import { SchemaProvider } from 'src/contexts/SchemaContext';

export const App = () => {
  return (
    <SchemaProvider>
      <Dashboard />
    </SchemaProvider>
  );
};

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchemaProvider } from 'src/contexts/SchemaContext';
import { Dashboard } from 'src/components/Dashboard.tsx';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SchemaProvider>
        <Dashboard />
      </SchemaProvider>
    </QueryClientProvider>
  );
};

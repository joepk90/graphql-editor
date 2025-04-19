import { useState, useEffect, FC } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorBoundary: FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return <div>Something went wrong!</div>;
  }

  return <>{children}</>;
};

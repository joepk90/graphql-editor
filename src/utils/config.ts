const apiUrl = window.__RUNTIME_ENV__.VITE_API_URL || import.meta.env.VITE_API_URL;
export const getApiUrl = () => apiUrl || 'http://localhost:9092';

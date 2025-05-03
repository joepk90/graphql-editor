import { getRuntimeEnvVar } from 'src/utils';

const apiUrl = getRuntimeEnvVar('VITE_API_URL') || import.meta.env.VITE_API_URL;

export const getApiUrl = () => apiUrl || 'http://localhost:9092';

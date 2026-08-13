import axios from 'axios';


const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const port = import.meta.env.VITE_API_PORT || '5000';
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${hostname}:${port}`;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;

import axios from 'axios';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');

// Normalize to ensure we always hit the external backend (append /api if missing)
const backendUrl = rawBackendUrl
  ? rawBackendUrl.endsWith('/api')
    ? rawBackendUrl
    : `${rawBackendUrl}/api`
  : '';

// In production we require VITE_BACKEND_URL to avoid accidentally calling localhost
const baseURL =
  backendUrl ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : (() => {
    console.error('VITE_BACKEND_URL is not set; API calls will fail in production.');
    return '';
  })());

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
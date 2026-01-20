import axios from 'axios';

const trimmed = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
// Normalize: ensure trailing /api and strip trailing slash noise
const backendUrl = trimmed
  ? (trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`)
  : undefined;

// Prefer env; only fall back to localhost during local dev
const baseURL = backendUrl || (import.meta.env.DEV ? 'http://localhost:10000/api' : '');

const api = axios.create({
  baseURL: 'https://imax-backend-web-service.onrender.com/api',
  withCredentials: true
});

export default api;
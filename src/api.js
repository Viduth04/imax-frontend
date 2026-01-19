import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
// Prefer the provided backend URL; only fall back to localhost during local dev
const baseURL = backendUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
import axios from 'axios';

const api = axios.create({
  // Use a fallback so it doesn't break if the env var is missing
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export default api;
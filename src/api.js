import axios from 'axios';

const api = axios.create({
  // This automatically picks the right URL based on where the app is running
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

export default api;
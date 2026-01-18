import axios from 'axios';

const api = axios.create({
  // This tells the app to use the URL from your .env file
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  withCredentials: true,
});

export default api;
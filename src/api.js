import api from '../api';

// This will help us debug in the browser console
console.log("Current Backend URL:", import.meta.env.VITE_BACKEND_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  withCredentials: true,
});

export default api;
//
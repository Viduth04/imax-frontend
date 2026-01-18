import axios from 'axios';

// Ensure the URL is taken from Vercel's environment variables
const baseURL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: baseURL, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: '/',           // ← very important: let the Vite proxy handle it
  withCredentials: true,  // send/receive cookies
});

export default api;

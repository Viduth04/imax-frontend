import api from '../api.js';

export const getBaseUrl = () => {
  // 1. Explicitly check the Vercel Environment Variable
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  
  if (envUrl) {
    // Remove /api and any trailing slashes to prevent // in the URL
    return envUrl.replace(/\/api$/, '').replace(/\/+$/, '');
  }

  // 2. Fallback to API defaults
  const apiBase = api?.defaults?.baseURL || '';
  if (apiBase.includes('/api')) {
    return apiBase.split('/api')[0].replace(/\/+$/, '');
  }
  
  return 'http://localhost:10000';
};
/**
 * Construct full image URL
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600?text=No+Image';
  if (path.startsWith('http')) return path;

  // 1. Get the base URL (e.g., https://imax-backend.onrender.com)
  // We remove /api if it accidentally exists
  const baseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000')
    .replace(/\/api$/, '')
    .replace(/\/+$/, '');

  // 2. Clean the path
  let cleanPath = path.replace(/\\/g, '/');
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

  // 3. Ensure 'uploads/' is present
  if (!cleanPath.toLowerCase().startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }

  return `${baseUrl}/${cleanPath}`;
};
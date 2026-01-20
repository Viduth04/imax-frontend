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
/**
 * Construct full image URL forcing the Backend domain
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/600x600?text=No+Image';
  
  // If the path is already a full URL (like from a CDN), return it
  if (imagePath.startsWith('http')) return imagePath;

  // Replace this URL with your ACTUAL Render backend URL
  const BASE_URL = 'https://your-backend-name.onrender.com'; 
  
  // Ensure there is a single slash between base URL and path
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BASE_URL}${cleanPath}`;
};
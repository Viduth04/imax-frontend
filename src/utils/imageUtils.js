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
  
  // If it's already a full URL (like a placeholder), use it
  if (imagePath.startsWith('http')) return imagePath;

  // YOUR ACTUAL RENDER BACKEND URL
  const BACKEND_URL = 'https://imax-backend-web-service.onrender.com'; 

  // Clean the path: remove leading slash to avoid "com//uploads"
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

  return `${BACKEND_URL}/${cleanPath}`;
};
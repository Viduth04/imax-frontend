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
  
  // If it's already a full external URL, return it
  if (imagePath.startsWith('http')) return imagePath;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://imax-backend.onrender.com';

  // 1. Clean the path: remove leading slashes
  let cleanPath = imagePath.replace(/^\/+/, ''); 

  // 2. Remove "uploads/" from the string if it exists to prevent /uploads/uploads/
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }

  // 3. Return the final clean URL pointing to the backend's static route
  return `${BACKEND_URL}/uploads/${cleanPath}`;
};
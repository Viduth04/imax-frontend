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
  
  // 1. Handle absolute URLs (like Cloudinary or external links)
  if (imagePath.startsWith('http')) return imagePath;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://imax-backend.onrender.com';

  // 2. Clean the path: Remove all leading slashes and redundant 'uploads/'
  // This handles both "/uploads/products/img.jpg" and "products/img.jpg"
  let cleanPath = imagePath.replace(/^\/+/, ''); 
  
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }

  // 3. Final URL Construction
  // Our backend index.js serves the 'uploads' folder at the '/uploads' route
  return `${BACKEND_URL}/uploads/${cleanPath}`;
};
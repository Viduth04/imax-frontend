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
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600?text=No+Image';
  
  // If it's already a full URL, don't touch it
  if (path.startsWith('http')) return path;

  // 1. YOUR LIVE BACKEND URL (Hardcoded for stability)
  const backendRoot = "https://imax-backend.onrender.com";

  // 2. Clean the path (Fix Windows backslashes)
  let cleanPath = path.replace(/\\/g, '/');
  
  // 3. Remove leading slash if it exists to prevent double slashes
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }

  // 4. Ensure 'uploads/' is at the start
  // This matches your backend app.use('/uploads', express.static(uploadsPath))
  if (!cleanPath.toLowerCase().startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }

  // 5. Construct the final Absolute URL
  const finalUrl = `${backendRoot}/${cleanPath}`;
  
  return finalUrl;
};
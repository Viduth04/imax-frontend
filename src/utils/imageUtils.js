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

  // 1. Define your backend root (Render URL)
  // We strip /api to ensure we point to the static folder root
  const backendRoot = "https://imax-backend.onrender.com";

  // 2. Clean the incoming path (fix Windows slashes)
  let cleanPath = path.replace(/\\/g, '/');
  
  // 3. Ensure the path starts with /uploads
  if (!cleanPath.toLowerCase().includes('uploads/')) {
    cleanPath = `uploads/products/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  }

  // 4. Ensure there is exactly one slash between domain and path
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  const finalUrl = `${backendRoot}${normalizedPath}`;
  
  console.log("🔗 Absolute Image Link:", finalUrl);
  return finalUrl;
};
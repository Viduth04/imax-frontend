import api from '../api.js';

/**
 * Get the base URL for serving static files (images)
 */
export const getBaseUrl = () => {
  const apiBase = api.defaults.baseURL || '';
  
  // If api instance has a baseURL (e.g., https://site.onrender.com/api), extract the root
  if (apiBase && apiBase.includes('/api')) {
    return apiBase.split('/api')[0];
  }
  
  // Fallback for local development
  if (import.meta.env.DEV) {
    return 'http://localhost:10000';
  }
  
  // Fallback for production environment variables
  const envUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
  if (envUrl) {
    return envUrl.split('/api')[0] || envUrl;
  }
  
  return '';
};

/**
 * Construct full image URL from a path
 */
export const getImageUrl = (path) => {
  if (!path) {
    return 'https://placehold.co/400x400?text=No+Image';
  }
  
  // If already a full URL (like an external link), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 1. Normalize slashes for Windows/Linux compatibility
  let cleanPath = path.replace(/\\/g, '/');
  
  // 2. CRITICAL: Remove "public/" from the start if it exists
  // Because the server serves the INSIDE of the public folder, not the folder itself
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.replace('public/', '');
  } else if (cleanPath.startsWith('/public/')) {
    cleanPath = cleanPath.replace('/public/', '/');
  }
  
  // 3. Ensure the path starts with a single /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // 4. Construct the full URL
  const base = getBaseUrl();
  const fullUrl = `${base}${cleanPath}`;
  
  // Helpful log for debugging in the browser console
  console.log('Image URL Debug:', { original: path, final: fullUrl });
  
  return fullUrl;
};
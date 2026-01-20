import api from '../api.js';

/**
 * Get the base URL for serving static files (images)
 * Strips /api from the axios baseURL to get the root server URL
 */
export const getBaseUrl = () => {
  try {
    const apiBase = api?.defaults?.baseURL || '';
    if (apiBase && apiBase.includes('/api')) {
      return apiBase.split('/api')[0];
    }
    
    // Fallback to environment variable or localhost
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl.replace(/\/api$/, '').replace(/\/+$/, '');
    
    return 'http://localhost:10000';
  } catch (error) {
    return 'http://localhost:10000';
  }
};

/**
 * Construct full image URL from a path
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600?text=No+Image';
  
  // 1. Return immediately if it's already a full URL
  if (path.startsWith('http')) return path;

  // 2. Fix Windows backslashes (\ to /)
  let cleanPath = path.replace(/\\/g, '/');

  // 3. Logic to ensure path includes '/uploads' correctly
  // If the path from DB is "products/image.jpg", we prepend "/uploads/"
  if (!cleanPath.toLowerCase().includes('uploads/')) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  } else {
    // If it already has "uploads/", just ensure it starts with a single "/"
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  const base = getBaseUrl().replace(/\/+$/, '');
  
  // 4. Remove any double slashes created during concatenation
  const fullUrl = `${base}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
  
  // 5. Add cache busting version
  const v = sessionStorage.getItem('imageCacheVersion') || '1';
  return `${fullUrl}?v=${v}`;
};
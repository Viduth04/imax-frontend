import api from '../api.js';

/**
 * Get the base URL for serving static files (images)
 */
export const getBaseUrl = () => {
  try {
    // 1. Check for Vercel/Production environment variable
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) {
      return envUrl.replace(/\/api$/, '').replace(/\/+$/, '');
    }

    // 2. Extract root from active axios instance
    const apiBase = api?.defaults?.baseURL || '';
    if (apiBase && apiBase.includes('/api')) {
      return apiBase.split('/api')[0];
    }
    
    // 3. Final local fallback
    return 'http://localhost:10000';
  } catch (error) {
    return 'http://localhost:10000';
  }
};

/**
 * Construct full image URL
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600?text=No+Image';
  
  if (path.startsWith('http')) return path;

  // Fix path slashes for cross-platform compatibility
  let cleanPath = path.replace(/\\/g, '/');

  // Ensure /uploads is included correctly
  if (!cleanPath.toLowerCase().includes('uploads/')) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  } else {
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  const base = getBaseUrl().replace(/\/+$/, '');
  
  // Combine base and path, removing double slashes except after 'http:'
  const fullUrl = `${base}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
  
  return `${fullUrl}?v=${sessionStorage.getItem('imageCacheVersion') || '1'}`;
};
import api from '../api.js';

/**
 * Get the base URL for serving static files (images)
 * This handles stripping /api and checking environment variables for production.
 */
export const getBaseUrl = () => {
  try {
    // 1. Check if we have an explicit VITE_BACKEND_URL set (Crucial for Vercel/Production)
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) {
      return envUrl.replace(/\/api$/, '').replace(/\/+$/, '');
    }

    // 2. Extract from the axios instance baseURL
    const apiBase = api?.defaults?.baseURL || '';
    if (apiBase && apiBase.includes('/api')) {
      return apiBase.split('/api')[0];
    }
    
    // 3. Fallback for local development
    return 'http://localhost:10000';
  } catch (error) {
    return 'http://localhost:10000';
  }
};

/**
 * Construct full image URL from a path stored in the DB
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600?text=No+Image';
  
  // Return immediately if it's already a full external URL
  if (path.startsWith('http')) return path;

  // Fix Windows backslashes (\ to /)
  let cleanPath = path.replace(/\\/g, '/');

  // Ensure path includes '/uploads' correctly without doubling it
  if (!cleanPath.toLowerCase().includes('uploads/')) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  } else {
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  const base = getBaseUrl().replace(/\/+$/, '');
  
  // Combine base and path, removing any potential triple slashes
  const fullUrl = `${base}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
  
  // Add cache busting version to ensure images update when replaced
  const v = sessionStorage.getItem('imageCacheVersion') || '1';
  return `${fullUrl}?v=${v}`;
};
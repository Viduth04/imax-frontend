import api from '../api.js';

/**
 * Dynamically identifies the backend root URL
 */
export const getBaseUrl = () => {
  try {
    // 1. Priority: Use the environment variable you set in Vercel
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) {
      return envUrl.replace(/\/api$/, '').replace(/\/+$/, '');
    }

    // 2. Fallback: Extract root from your Axios config
    const apiBase = api?.defaults?.baseURL || '';
    if (apiBase && apiBase.includes('/api')) {
      return apiBase.split('/api')[0];
    }
    
    // 3. Dev Fallback
    return 'http://localhost:10000';
  } catch (error) {
    return 'http://localhost:10000';
  }
};

/**
 * Creates the final URL for the <img> tag
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x600?text=No+Image';
  
  if (path.startsWith('http')) return path;

  // Standardize slashes for Windows/Linux
  let cleanPath = path.replace(/\\/g, '/');

  // Ensure /uploads is included
  if (!cleanPath.toLowerCase().includes('uploads/')) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  } else {
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  const base = getBaseUrl().replace(/\/+$/, '');
  
  // Combine and remove double slashes (except after http:)
  const fullUrl = `${base}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
  
  return `${fullUrl}?v=${sessionStorage.getItem('imageCacheVersion') || '1'}`;
};
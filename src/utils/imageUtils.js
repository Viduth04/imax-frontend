import api from '../api.js';

/**
 * Get the base URL for serving static files (images)
 */
export const getBaseUrl = () => {
  const apiBase = api.defaults.baseURL || '';
  
  // If VITE_BACKEND_URL is set, extract the base URL
  if (apiBase && apiBase.includes('/api')) {
    return apiBase.split('/api')[0];
  }
  
  // For local development, use localhost:10000 (backend port)
  if (import.meta.env.DEV) {
    return 'http://localhost:10000';
  }
  
  // For production, try to extract from env or use empty string
  const envUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
  if (envUrl) {
    return envUrl.split('/api')[0] || envUrl;
  }
  
  return '';
};

/**
 * Construct full image URL from a path
 * @param {string} path - Image path from database (e.g., "/uploads/products/filename.jpg")
 * @returns {string} Full URL to the image
 */
export const getImageUrl = (path) => {
  if (!path) {
    console.warn('⚠️ No image path provided');
    return 'https://placehold.co/400x400?text=No+Image';
  }
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Normalize the path - ensure it starts with /uploads
  let cleanPath = path.replace(/\\/g, '/');
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Ensure it's the uploads path
  if (!cleanPath.startsWith('/uploads')) {
    cleanPath = '/uploads' + (cleanPath.startsWith('/') ? '' : '/') + cleanPath.replace(/^\/+/, '');
  }
  
  // Construct full URL
  const base = getBaseUrl() || 'http://localhost:10000';
  const fullUrl = `${base}${cleanPath}`;
  
  // Debug logging - only log once per unique path
  if (!getImageUrl.loggedPaths) {
    getImageUrl.loggedPaths = new Set();
  }
  if (!getImageUrl.loggedPaths.has(path)) {
    getImageUrl.loggedPaths.add(path);
    console.log('🖼️ Image URL:', {
      originalPath: path,
      cleanedPath: cleanPath,
      baseUrl: base,
      fullUrl: fullUrl
    });
  }
  
  return fullUrl;
};

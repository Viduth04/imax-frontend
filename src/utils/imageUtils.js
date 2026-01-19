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
  
  // Remove any double slashes
  cleanPath = cleanPath.replace(/\/+/g, '/');
  
  // Ensure it starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Ensure it's the uploads path (backend saves as /uploads/products/filename)
  if (!cleanPath.startsWith('/uploads')) {
    // If path doesn't start with /uploads, prepend it
    cleanPath = '/uploads' + (cleanPath.startsWith('/') ? '' : '/') + cleanPath.replace(/^\/+/, '');
  }
  
  // Construct full URL
  const base = getBaseUrl() || 'http://localhost:10000';
  let fullUrl = `${base}${cleanPath}`;
  
  // Add cache-busting parameter for updated images (prevents browser cache issues)
  // Use a timestamp based on when the path was last modified (if we can detect updates)
  // For now, add a version parameter that changes when images are updated
  const cacheBuster = sessionStorage.getItem('imageCacheVersion') || '1';
  if (fullUrl.includes('?')) {
    fullUrl += `&v=${cacheBuster}`;
  } else {
    fullUrl += `?v=${cacheBuster}`;
  }
  
  // Debug logging - log all calls for debugging (only in dev or when debugging)
  if (import.meta.env.DEV || (typeof window !== 'undefined' && window.location?.search?.includes('debug=1'))) {
    console.log('🖼️ getImageUrl called:', {
      originalPath: path,
      cleanedPath: cleanPath,
      baseUrl: base,
      fullUrl: fullUrl,
      apiBase: api.defaults.baseURL,
      windowOrigin: typeof window !== 'undefined' ? window.location.origin : '',
      env: import.meta.env.DEV ? 'dev' : 'prod',
      cacheVersion: cacheBuster
    });
  }
  
  return fullUrl;
};

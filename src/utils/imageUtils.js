import api from '../api.js';

/**
 * Get the base URL for serving static files (images)
 * This should match the backend server URL without /api
 */
export const getBaseUrl = () => {
  try {
    // Method 1: Extract from API base URL (most reliable)
    const apiBase = api?.defaults?.baseURL || '';
    if (apiBase && typeof apiBase === 'string' && apiBase.includes('/api')) {
      const base = apiBase.split('/api')[0];
      if (import.meta.env.DEV) {
        console.log('✅ Base URL from api.defaults.baseURL:', base);
      }
      return base;
    }
    
    // Method 2: Use environment variable
    const envUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
    if (envUrl) {
      const base = envUrl.includes('/api') ? envUrl.split('/api')[0] : envUrl;
      if (import.meta.env.DEV) {
        console.log('✅ Base URL from VITE_BACKEND_URL:', base);
      }
      return base;
    }
    
    // Method 3: Default to localhost:10000 for development
    if (import.meta.env.DEV) {
      const devBase = 'http://localhost:10000';
      console.log('✅ Base URL (dev default):', devBase);
      return devBase;
    }
    
    // Method 4: Try to get from current window location (for production)
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      if (import.meta.env.DEV) {
        console.log('✅ Base URL from window.location.origin:', origin);
      }
      return origin;
    }
    
    // Fallback
    if (import.meta.env.DEV) {
      console.warn('⚠️ Could not determine base URL, using localhost:10000 as fallback');
    }
    return 'http://localhost:10000';
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('❌ Error in getBaseUrl:', error);
    }
    return 'http://localhost:10000';
  }
};

/**
 * Construct full image URL from a path
 * @param {string} path - Image path from database (e.g., "/uploads/products/filename.jpg")
 * @returns {string} Full URL to the image
 */
export const getImageUrl = (path) => {
  if (!path) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ getImageUrl: No image path provided');
    }
    return 'https://placehold.co/400x400?text=No+Image';
  }
  
  // If already a full URL, add cache busting and return
  if (path.startsWith('http://') || path.startsWith('https://')) {
    const cacheBuster = typeof window !== 'undefined' ? (sessionStorage.getItem('imageCacheVersion') || '1') : '1';
    const separator = path.includes('?') ? '&' : '?';
    const urlWithCache = `${path}${separator}v=${cacheBuster}`;
    if (import.meta.env.DEV) {
      console.log('🖼️ Full URL provided, added cache:', urlWithCache);
    }
    return urlWithCache;
  }
  
  // Normalize the path
  let cleanPath = String(path)
    .replace(/\\/g, '/')  // Convert backslashes to forward slashes
    .replace(/\/+/g, '/')  // Remove multiple slashes
    .trim();
  
  // Ensure it starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Ensure it's the uploads path (backend saves as /uploads/products/filename)
  if (!cleanPath.startsWith('/uploads')) {
    // If path doesn't start with /uploads, prepend it
    const pathWithoutLeadingSlash = cleanPath.replace(/^\/+/, '');
    cleanPath = `/uploads/${pathWithoutLeadingSlash}`;
  }
  
  // Get base URL
  const base = getBaseUrl();
  
  // Construct full URL
  let fullUrl = `${base}${cleanPath}`;
  
  // Remove any double slashes that might have been created (except after http://)
  fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');
  
  // Add cache-busting parameter
  const cacheBuster = typeof window !== 'undefined' ? (sessionStorage.getItem('imageCacheVersion') || Date.now().toString()) : '1';
  const separator = fullUrl.includes('?') ? '&' : '?';
  fullUrl = `${fullUrl}${separator}v=${cacheBuster}`;
  
  // Always log in development for debugging
  if (import.meta.env.DEV) {
    console.log('🖼️ getImageUrl:', {
      originalPath: path,
      cleanedPath: cleanPath,
      baseUrl: base,
      fullUrl: fullUrl,
      apiBaseURL: api?.defaults?.baseURL || 'not set',
      cacheVersion: cacheBuster
    });
  }
  
  return fullUrl;
};

import api from '../api.js';

/**
 * Get the base URL for the backend
 */
export const getBaseUrl = () => {
  // 1. Check environment variable first
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/api$/, '').replace(/\/+$/, '');
  }

  // 2. Fallback to API base URL
  const apiBase = api?.defaults?.baseURL || '';
  if (apiBase.includes('/api')) {
    return apiBase.split('/api')[0].replace(/\/+$/, '');
  }

  // 3. Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:10000';
  }

  // 4. Production fallback
  return 'https://imax-backend.onrender.com';
};

/**
 * Construct full image URL with proper cache busting
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://placehold.co/400x400?text=No+Image';
  }

  // If already a full URL, add cache busting
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const cacheBuster = typeof window !== 'undefined' ? (sessionStorage.getItem('imageCacheVersion') || Date.now().toString()) : '1';
    const separator = imagePath.includes('?') ? '&' : '?';
    return `${imagePath}${separator}v=${cacheBuster}`;
  }

  // Clean the path
  let cleanPath = imagePath
    .replace(/\\/g, '/') // Convert backslashes
    .replace(/\/+/g, '/') // Remove double slashes
    .replace(/^\/+/, ''); // Remove leading slashes

  // Remove redundant "uploads/" prefix if present
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }

  // Get base URL
  const baseUrl = getBaseUrl();

  // Add cache busting to prevent stale images
  const cacheBuster = typeof window !== 'undefined' ? (sessionStorage.getItem('imageCacheVersion') || Date.now().toString()) : '1';

  // Construct final URL
  const finalUrl = `${baseUrl}/uploads/${cleanPath}?v=${cacheBuster}`;

  console.log('🖼️ Image URL constructed:', {
    original: imagePath,
    cleaned: cleanPath,
    baseUrl: baseUrl,
    finalUrl: finalUrl
  });

  return finalUrl;
};
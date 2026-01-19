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
// src/utils/imageUtils.js
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/600x600?text=No+Image';
  
  // If the path is already a full URL (like a placeholder or cloud storage), return it
  if (imagePath.startsWith('http')) return imagePath;

  // 1. Replace Windows-style backslashes with forward slashes
  // 2. Ensure it starts with /uploads/
  const sanitizedPath = imagePath.replace(/\\/g, '/');
  const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;
  
  // Set your backend URL (make sure this matches your Express server port)
  const backendUrl = 'http://localhost:5000'; 
  
  return `${backendUrl}${cleanPath}`;
};
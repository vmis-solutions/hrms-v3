/**
 * Centralized API configuration
 * 
 * To change the API base URL:
 * 1. Set NEXT_PUBLIC_API_BASE_URL environment variable at build time
 * 2. Or set window.API_BASE_URL in the browser console before login
 * 3. Or set localStorage.setItem('api_base_url', 'http://your-api-url') before login
 * 
 * Example: Create a .env.local file with:
 * NEXT_PUBLIC_API_BASE_URL=http://172.20.10.168:9001
 */
const getApiBaseUrl = (): string => {
  // Runtime configuration (highest priority)
  if (typeof window !== 'undefined') {
    // Check window object first (can be set via browser console)
    if ((window as any).API_BASE_URL) {
      return (window as any).API_BASE_URL;
    }
    // Check localStorage (can be set before login)
    const storedUrl = localStorage.getItem('api_base_url');
    if (storedUrl) {
      return storedUrl;
    }
  }
  
  // Build-time configuration
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.20.10.168:9001';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper function to build API endpoint URLs
 * @param endpoint - The API endpoint path (e.g., '/api/Company')
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

/**
 * Get the current API base URL (for debugging)
 */
export const getCurrentApiBaseUrl = (): string => {
  return getApiBaseUrl();
};


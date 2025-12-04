/**
 * Centralized API configuration
 * 
 * To change the API base URL, update the default value below or set the
 * NEXT_PUBLIC_API_BASE_URL environment variable.
 * 
 * Example: Create a .env.local file with:
 * NEXT_PUBLIC_API_BASE_URL=http://172.20.10.168:9001
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.20.10.168:9001';

/**
 * Helper function to build API endpoint URLs
 * @param endpoint - The API endpoint path (e.g., '/api/Company')
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};


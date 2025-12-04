import { getAuthToken, handleTokenExpiration } from '@/contexts/AuthContext';

/**
 * Centralized API fetch wrapper that handles authentication and token expiration
 * Automatically redirects to login when a 401 Unauthorized response is received
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  // Build headers
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add Content-Type if not already set and not FormData
  // Note: Don't set Content-Type for FormData - browser will set it with boundary
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the fetch request
  const response = await fetch(url, {
    ...options,
    headers,
    // @ts-ignore
    credentials: 'omit',
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear authentication and redirect to login
    handleTokenExpiration();
    throw new Error('Your session has expired. Please log in again.');
  }

  return response;
};

/**
 * Helper function to get auth headers (for cases where you need headers separately)
 */
export const getAuthHeaders = (includeContentType: boolean = true): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};


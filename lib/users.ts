import { SystemUser } from '@/types';
import { apiFetch } from '@/lib/api';
import { getApiUrl } from '@/lib/config';

const API_BASE_URL = getApiUrl('/api/User');

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

interface UserApiResponse {
  id: string;
  userName: string;
  email: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  employeeNumber: string;
}

interface UserListApiResponse {
  items: UserApiResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedUsersResult {
  items: SystemUser[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface UserPaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

// getAuthHeaders is now imported from lib/api

const mapUserResponse = (user: UserApiResponse): SystemUser => {
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
    employeeId: user.employeeId,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName || undefined,
    employeeNumber: user.employeeNumber,
  };
};

const buildUserQuery = (params?: UserPaginationParams) => {
  const searchParams = new URLSearchParams();
  if (params?.pageNumber) {
    searchParams.set('pageNumber', params.pageNumber.toString());
  }
  if (params?.pageSize) {
    searchParams.set('pageSize', params.pageSize.toString());
  }
  if (params?.search && params.search.trim().length > 0) {
    searchParams.set('search', params.search.trim());
  }
  const queryString = searchParams.toString();
  return queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
};

const handleUserApiError = (error: any) => {
  console.error('User API error:', error);
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    throw new Error('Unable to connect to the API server. Please check if it is running and that CORS/SSL settings allow requests from the frontend.');
  }
  if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
    throw new Error('SSL certificate error. Visit the API base URL in your browser to trust the certificate or switch to HTTP during development.');
  }
  throw error;
};

export const getUsersPaginated = async (
  params?: UserPaginationParams
): Promise<PaginatedUsersResult> => {
  try {
    const response = await apiFetch(buildUserQuery(params), {
      method: 'GET',
    });

    if (!response.ok) {

      const errorText = await response.text();
      let errorMessage = `Failed to fetch users: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<UserListApiResponse> = await response.json();

    if (result.success && result.data) {
      return {
        items: result.data.items.map(mapUserResponse),
        totalCount: result.data.totalCount,
        pageNumber: result.data.pageNumber,
        pageSize: result.data.pageSize,
        totalPages: result.data.totalPages,
        hasPrevious: result.data.hasPrevious,
        hasNext: result.data.hasNext,
      };
    }

    throw new Error(result.message || 'Failed to fetch users');
  } catch (error: any) {
    handleUserApiError(error);
  }
};

export interface UserInput {
  userName: string;
  email: string;
  password: string;
  employeeId: string;
}

interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  data: {
    errors: ValidationError[];
  };
}

export const createUser = async (user: UserInput): Promise<SystemUser> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        userName: user.userName,
        email: user.email,
        password: user.password,
        employeeId: user.employeeId,
      }),
    });

    if (!response.ok) {

      const errorText = await response.text();
      let errorMessage = `Failed to create user: ${response.status} ${response.statusText}`;
      let validationErrors: ValidationError[] = [];
      
      try {
        const errorData: ValidationErrorResponse = JSON.parse(errorText);
        
        // Check if this is a validation error response
        if (errorData.data?.errors && Array.isArray(errorData.data.errors)) {
          validationErrors = errorData.data.errors;
          // Create a custom error with validation details
          const validationError = new Error(errorData.message || 'Validation failed');
          (validationError as any).validationErrors = validationErrors;
          throw validationError;
        }
        
        errorMessage = errorData.message || errorMessage;
      } catch (parseError: any) {
        // If it's our validation error, re-throw it
        if (parseError.validationErrors) {
          throw parseError;
        }
        // Otherwise, use the text as error message
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<UserApiResponse> = await response.json();

    if (result.success && result.data) {
      return mapUserResponse(result.data);
    }

    throw new Error(result.message || 'Failed to create user');
  } catch (error: any) {
    // If it's a validation error, don't call handleUserApiError
    if (error.validationErrors) {
      throw error;
    }
    handleUserApiError(error);
    throw error;
  }
};

export const updateUser = async (id: string, user: UserInput): Promise<SystemUser> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        userName: user.userName,
        email: user.email,
        password: user.password,
        employeeId: user.employeeId,
      }),
    });

    if (!response.ok) {

      const errorText = await response.text();
      let errorMessage = `Failed to update user: ${response.status} ${response.statusText}`;
      let validationErrors: ValidationError[] = [];
      
      try {
        const errorData: ValidationErrorResponse = JSON.parse(errorText);
        
        // Check if this is a validation error response
        if (errorData.data?.errors && Array.isArray(errorData.data.errors)) {
          validationErrors = errorData.data.errors;
          // Create a custom error with validation details
          const validationError = new Error(errorData.message || 'Validation failed');
          (validationError as any).validationErrors = validationErrors;
          throw validationError;
        }
        
        errorMessage = errorData.message || errorMessage;
      } catch (parseError: any) {
        // If it's our validation error, re-throw it
        if (parseError.validationErrors) {
          throw parseError;
        }
        // Otherwise, use the text as error message
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<UserApiResponse> = await response.json();

    if (result.success && result.data) {
      return mapUserResponse(result.data);
    }

    throw new Error(result.message || 'Failed to update user');
  } catch (error: any) {
    // If it's a validation error, don't call handleUserApiError
    if (error.validationErrors) {
      throw error;
    }
    handleUserApiError(error);
    throw error;
  }
};


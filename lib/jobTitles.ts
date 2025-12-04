import { JobTitle } from '@/types';
import { apiFetch } from '@/lib/api';
import { getApiUrl } from '@/lib/config';

const API_BASE_URL = getApiUrl('/api/JobTitle');

// getAuthHeaders is now imported from lib/api

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

interface JobTitleApiResponse {
  id: string;
  title: string;
  description?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface JobTitleListApiResponse {
  items: JobTitleApiResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface JobTitlePaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  companyId?: string;
}

export interface PaginatedJobTitlesResult {
  items: JobTitle[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

const buildJobTitleQuery = (params?: JobTitlePaginationParams) => {
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
  if (params?.departmentId) {
    searchParams.set('departmentId', params.departmentId);
  }
  if (params?.companyId) {
    searchParams.set('companyId', params.companyId);
  }

  const queryString = searchParams.toString();
  return queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
};

const mapJobTitleResponse = (jobTitle: JobTitleApiResponse): JobTitle => {
  const fallbackTimestamp = new Date().toISOString();

  return {
    id: jobTitle.id,
    title: jobTitle.title,
    description: jobTitle.description || undefined,
    departmentId: jobTitle.departmentId || '',
    companyId: jobTitle.companyId || undefined,
    createdAt: jobTitle.createdAt || fallbackTimestamp,
    updatedAt: jobTitle.updatedAt || fallbackTimestamp,
    departmentName: jobTitle.departmentName || undefined,
    companyName: jobTitle.companyName || undefined,
  };
};

const handleNetworkError = (error: any) => {
  console.error('Job Title API error:', error);
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    throw new Error('Unable to connect to the API server. Ensure it is running and that CORS settings allow this origin.');
  }
  if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
    throw new Error('SSL certificate error. Visit the API base URL in your browser to trust the certificate or switch to HTTP during development.');
  }
  throw error;
};

export const getJobTitlesPaginated = async (
  params?: JobTitlePaginationParams
): Promise<PaginatedJobTitlesResult> => {
  try {
    const response = await apiFetch(buildJobTitleQuery(params), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch job titles: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<JobTitleListApiResponse> = await response.json();

    if (result.success && result.data) {
      return {
        items: result.data.items.map(mapJobTitleResponse),
        totalCount: result.data.totalCount,
        pageNumber: result.data.pageNumber,
        pageSize: result.data.pageSize,
        totalPages: result.data.totalPages,
        hasPrevious: result.data.hasPrevious,
        hasNext: result.data.hasNext,
      };
    }

    throw new Error(result.message || 'Failed to fetch job titles');
  } catch (error: any) {
    handleNetworkError(error);
    throw error;
  }
};

export const getJobTitles = async (params?: JobTitlePaginationParams): Promise<JobTitle[]> => {
  const pageSize = params?.pageSize ?? 100;
  const pageNumber = params?.pageNumber ?? 1;

  const result = await getJobTitlesPaginated({
    ...params,
    pageSize,
    pageNumber,
  });

  return result.items;
};

export const getJobTitleById = async (id: string): Promise<JobTitle | null> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch job title: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<JobTitleApiResponse> = await response.json();
    if (result.success && result.data) {
      return mapJobTitleResponse(result.data);
    }

    return null;
  } catch (error: any) {
    handleNetworkError(error);
    throw error;
  }
};

export interface JobTitleInput {
  title: string;
  description?: string;
  departmentId?: string;
  companyId?: string;
}

export const createJobTitle = async (jobTitle: JobTitleInput): Promise<JobTitle> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        title: jobTitle.title,
        description: jobTitle.description || '',
        departmentId: jobTitle.departmentId || null,
        companyId: jobTitle.companyId || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create job title: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<JobTitleApiResponse> = await response.json();
    if (result.success && result.data) {
      return mapJobTitleResponse(result.data);
    }

    throw new Error(result.message || 'Failed to create job title');
  } catch (error: any) {
    handleNetworkError(error);
    throw error;
  }
};

export const updateJobTitle = async (id: string, updates: JobTitleInput): Promise<JobTitle> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        title: updates.title,
        description: updates.description || '',
        departmentId: updates.departmentId || null,
        companyId: updates.companyId || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update job title: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<JobTitleApiResponse> = await response.json();
    if (result.success && result.data) {
      return mapJobTitleResponse(result.data);
    }

    throw new Error(result.message || 'Failed to update job title');
  } catch (error: any) {
    handleNetworkError(error);
    throw error;
  }
};

export const deleteJobTitle = async (id: string): Promise<void> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete job title: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    handleNetworkError(error);
    throw error;
  }
};


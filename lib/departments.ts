import { Department } from '@/types';
import { apiFetch } from '@/lib/api';
import { getApiUrl } from '@/lib/config';

const API_BASE_URL = getApiUrl('/api/Department');

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

interface DepartmentApiResponse {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  headEmployeeId?: string | null;
  companyName?: string;
  employeeCount?: number;
  hrManagers?: { id?: string; name?: string; email?: string }[];
}

// getAuthHeaders is now imported from lib/api

const mapDepartment = (dept: DepartmentApiResponse): Department => {
  const now = new Date().toISOString();
  return {
    id: dept.id,
    name: dept.name,
    description: dept.description,
    companyId: dept.companyId,
    headId: dept.headEmployeeId || undefined,
    headEmployeeId: dept.headEmployeeId,
    companyName: dept.companyName,
    employeeCount: dept.employeeCount,
    hrManagers: dept.hrManagers,
    createdAt: now,
    updatedAt: now,
  };
};

export const getManagedDepartments = async (): Promise<Department[]> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/GetManagedDepartments`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch departments: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<DepartmentApiResponse[]> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<DepartmentApiResponse[]> = await response.json();

    if (result.success && result.data) {
      return result.data.map(mapDepartment);
    }

    throw new Error(result.message || 'Failed to fetch departments');
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

// Backwards compatible function name
export const getDepartments = getManagedDepartments;

export const createDepartment = async (
  department: {
    name: string;
    description?: string;
    companyId: string;
    headEmployeeId?: string;
  }
): Promise<Department> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        name: department.name,
        description: department.description || '',
        companyId: department.companyId,
        headEmployeeId: department.headEmployeeId || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create department: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<DepartmentApiResponse> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<DepartmentApiResponse> = await response.json();

    if (result.success && result.data) {
      return mapDepartment(result.data);
    }

    throw new Error(result.message || 'Failed to create department');
  } catch (error: any) {
    console.error('Error creating department:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const updateDepartment = async (
  id: string,
  updates: {
    name?: string;
    description?: string;
    companyId?: string;
    headEmployeeId?: string;
  }
): Promise<Department> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'PUT',
      body: JSON.stringify({
        id: id,
        name: updates.name,
        description: updates.description || '',
        companyId: updates.companyId,
        headEmployeeId: updates.headEmployeeId || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update department: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<DepartmentApiResponse> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<DepartmentApiResponse> = await response.json();

    if (result.success && result.data) {
      return mapDepartment(result.data);
    }

    throw new Error(result.message || 'Failed to update department');
  } catch (error: any) {
    console.error('Error updating department:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const assignHRManagersToDepartment = async (
  departmentId: string,
  employeeIds: string[]
): Promise<void> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/hr-managers/assign`, {
      method: 'POST',
      body: JSON.stringify({
        departmentId: departmentId,
        employeeIds: employeeIds,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to assign HR managers: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<any> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to assign HR managers');
    }
  } catch (error: any) {
    console.error('Error assigning HR managers:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export interface DepartmentHRManager {
  id: string;
  departmentId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeNumber: string;
  assignedAt: string;
}

const HR_MANAGER_API_BASE_URL = getApiUrl('/api/DepartmentHrManager');

export const getDepartmentHRManagers = async (departmentId: string): Promise<DepartmentHRManager[]> => {
  try {
    const response = await apiFetch(`${HR_MANAGER_API_BASE_URL}/department/${departmentId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch HR managers: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<DepartmentHRManager[]> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<DepartmentHRManager[]> = await response.json();

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.message || 'Failed to fetch HR managers');
  } catch (error: any) {
    console.error('Error fetching HR managers:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const deleteDepartmentHRManager = async (hrManagerId: string): Promise<void> => {
  try {
    const response = await apiFetch(`${HR_MANAGER_API_BASE_URL}/${hrManagerId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete HR manager: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<any> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to delete HR manager');
    }
  } catch (error: any) {
    console.error('Error deleting HR manager:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};


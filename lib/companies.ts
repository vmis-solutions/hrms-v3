import { Company } from '@/types';
import { apiFetch } from '@/lib/api';
import { getApiUrl } from '@/lib/config';

// API Configuration is now centralized in lib/config.ts
// To change the API base URL, update lib/config.ts or set NEXT_PUBLIC_API_BASE_URL environment variable
const API_BASE_URL = getApiUrl('/api/Company');

// getAuthHeaders is now imported from lib/api

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// Company CRUD operations
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch companies: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<Company[]> = await response.json();
    
    if (result.success && result.data) {
      // Map API response to Company type, adding default values for missing fields
      return result.data.map(company => ({
        ...company,
        createdAt: company.createdAt || new Date().toISOString(),
        updatedAt: company.updatedAt || new Date().toISOString(),
      }));
    }
    
    throw new Error(result.message || 'Failed to fetch companies');
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    // Provide more helpful error messages
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const getCompanyById = async (id: string): Promise<Company | null> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch company: ${response.statusText}`);
    }

    const result: ApiResponse<Company> = await response.json();
    
    if (result.success && result.data) {
      // Map API response to Company type, adding default values for missing fields
      return {
        ...result.data,
        createdAt: result.data.createdAt || new Date().toISOString(),
        updatedAt: result.data.updatedAt || new Date().toISOString(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
};

export const createCompany = async (
  company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'departments'>
): Promise<Company> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        name: company.name,
        description: company.description || '',
        address: company.address || '',
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create company: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<Company> = await response.json();
    
    if (result.success && result.data) {
      // Map API response to Company type, adding default values for missing fields
      return {
        ...result.data,
        createdAt: result.data.createdAt || new Date().toISOString(),
        updatedAt: result.data.updatedAt || new Date().toISOString(),
      };
    }
    
    throw new Error(result.message || 'Failed to create company');
  } catch (error: any) {
    console.error('Error creating company:', error);
    // Provide more helpful error messages
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const updateCompany = async (
  id: string,
  company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'departments'>
): Promise<Company> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'PUT',
      body: JSON.stringify({
        id: id,
        name: company.name,
        description: company.description || '',
        address: company.address || '',
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update company: ${response.statusText}`);
    }

    const result: ApiResponse<Company> = await response.json();
    
    if (result.success && result.data) {
      // Map API response to Company type, adding default values for missing fields
      return {
        ...result.data,
        createdAt: result.data.createdAt || new Date().toISOString(),
        updatedAt: result.data.updatedAt || new Date().toISOString(),
      };
    }
    
    throw new Error(result.message || 'Failed to update company');
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const deleteCompany = async (id: string): Promise<void> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete company: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};


import { apiFetch } from '@/lib/api';
import { getApiUrl } from '@/lib/config';

const API_BASE_URL = getApiUrl('/api/Dashboard');

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// getAuthHeaders is now imported from lib/api

export interface DashboardTrend {
  change: number;
  isIncrease: boolean;
  description: string;
}

export interface DashboardStatsResponse {
  totalEmployees: number;
  regularEmployees: number;
  probationaryEmployees: number;
  contractualEmployees: number;
  projectBasedEmployees: number;
  resignedEmployees: number;
  terminatedEmployees: number;
  totalEmployeesTrend: DashboardTrend;
  regularEmployeesTrend: DashboardTrend;
  probationaryEmployeesTrend: DashboardTrend;
  contractualEmployeesTrend: DashboardTrend;
}

export type ActivityType = 'hire' | 'status_change' | 'document' | 'leave' | 'promotion' | 'termination' | 'resignation' | 'profile_update';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  employeeId: string;
  action: string;
  status?: string | null;
  timestamp: string;
  createdAt: string;
  employeeName: string;
  employeePosition: string;
  employeeAvatar?: string | null;
}

export interface UpcomingBirthdayResponse {
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string | null;
  jobTitle: string;
  department: string;
  birthDate: string;
  nextBirthday: string;
  daysUntil: number;
  age: number;
  isToday: boolean;
  isThisWeek: boolean;
}

export const getDashboardStats = async (companyId?: string): Promise<DashboardStatsResponse> => {
  try {
    const url = companyId 
      ? `${API_BASE_URL}/Stats?companyId=${companyId}`
      : `${API_BASE_URL}/Stats`;
    
    const response = await apiFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch dashboard stats: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<DashboardStatsResponse> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<DashboardStatsResponse> = await response.json();

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.message || 'Failed to fetch dashboard stats');
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const getRecentActivities = async (limit: number = 10, companyId?: string): Promise<RecentActivity[]> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (companyId) {
      params.append('companyId', companyId);
    }
    
    const url = `${API_BASE_URL}/RecentActivities?${params.toString()}`;
    
    const response = await apiFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch recent activities: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<RecentActivity[]> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<RecentActivity[]> = await response.json();

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.message || 'Failed to fetch recent activities');
  } catch (error: any) {
    console.error('Error fetching recent activities:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const getUpcomingBirthdays = async (days: number = 30, companyId?: string): Promise<UpcomingBirthdayResponse[]> => {
  try {
    const params = new URLSearchParams();
    params.append('days', days.toString());
    if (companyId) {
      params.append('companyId', companyId);
    }
    
    const url = `${API_BASE_URL}/UpcomingBirthdays?${params.toString()}`;
    
    const response = await apiFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch upcoming birthdays: ${response.status} ${response.statusText}`;
      try {
        const errorData: ApiResponse<UpcomingBirthdayResponse[]> = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<UpcomingBirthdayResponse[]> = await response.json();

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.message || 'Failed to fetch upcoming birthdays');
  } catch (error: any) {
    console.error('Error fetching upcoming birthdays:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};


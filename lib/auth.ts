import { User, UserRole } from '@/types';
import { apiFetch } from '@/lib/api';
import { getApiUrl, getCurrentApiBaseUrl } from '@/lib/config';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
    role: UserRole;
    expiresAt: string;
  } | null;
  errors: string[] | null;
}

// Helper function to parse fullName into firstName and lastName
const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(' ');
  return { firstName, lastName };
};

export const authenticate = async (username: string, password: string): Promise<{ user: User; token: string } | null> => {
  const apiUrl = getApiUrl('/api/Auth/login');
  
  try {
    console.log('Attempting login to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // @ts-ignore
      credentials: 'omit',
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Login failed: ${response.status} ${response.statusText}`;
      try {
        const errorData: LoginResponse = JSON.parse(errorText);
        if (!errorData.success && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error('Login API error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }

    const result: LoginResponse = await response.json();

    if (result.success && result.data) {
      const { firstName, lastName } = parseFullName(result.data.fullName);
      
      const user: User = {
        id: result.data.userId,
        email: result.data.email,
        firstName,
        lastName,
        role: result.data.role,
      };

      return {
        user,
        token: result.data.token,
      };
    }

    throw new Error(result.message || 'Login failed');
  } catch (error: any) {
    console.error('Authentication error:', {
      error,
      apiUrl,
      message: error.message
    });
    
    // Provide more helpful error messages
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
      const apiBaseUrl = getCurrentApiBaseUrl();
      throw new Error(
        `Unable to connect to the API server at ${apiBaseUrl}. ` +
        `Please check: 1) The API server is running, 2) The API URL is correct, ` +
        `3) CORS is properly configured. ` +
        `You can set the API URL by running: localStorage.setItem('api_base_url', 'http://your-api-url') in the browser console.`
      );
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    throw error;
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'HR_MANAGER':
      return 'HR Manager';
    case 'HR_SUPERVISOR':
      return 'HR Supervisor';
    case 'HR_COMPANY':
      return 'HR Company Level';
    case 'DEPARTMENT_HEAD':
      return 'Department Head';
    case 'EMPLOYEE':
      return 'Employee';
    default:
      return 'Unknown Role';
  }
};

export const canAccessEmployeeManagement = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR', 'HR_COMPANY', 'DEPARTMENT_HEAD'].includes(role);
};

export const canEditEmployee = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR', 'HR_COMPANY'].includes(role);
};

export const canDeleteEmployee = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR'].includes(role);
};

export const canManageCompany = (role: UserRole): boolean => {
  return role === 'HR_MANAGER';
};

export const canManageDepartments = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR'].includes(role);
};

export const canManageJobTitles = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR', 'HR_COMPANY'].includes(role);
};

export const canManageUsers = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR'].includes(role);
};

export const canApplyLeave = (role: UserRole): boolean => {
  return true; // All users can apply for leave
};

export const canApproveDepartmentLeave = (role: UserRole): boolean => {
  return role === 'DEPARTMENT_HEAD';
};

export const canAcknowledgeLeave = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR', 'HR_COMPANY'].includes(role);
};

export const canViewAllLeaves = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR', 'HR_COMPANY'].includes(role);
};

export const canViewDepartmentLeaves = (role: UserRole): boolean => {
  return ['HR_MANAGER', 'HR_SUPERVISOR', 'HR_COMPANY', 'DEPARTMENT_HEAD'].includes(role);
};

export const getAccessLevel = (role: UserRole): 'FULL' | 'COMPANY' | 'DEPARTMENT' | 'LIMITED' => {
  switch (role) {
    case 'HR_MANAGER':
      return 'FULL';
    case 'HR_SUPERVISOR':
      return 'COMPANY';
    case 'HR_COMPANY':
      return 'COMPANY';
    case 'DEPARTMENT_HEAD':
      return 'DEPARTMENT';
    case 'EMPLOYEE':
      return 'LIMITED';
    default:
      return 'LIMITED';
  }
};

interface ChangePasswordRequest {
  CurrentPassword: string;
  NewPassword: string;
  ConfirmNewPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: null;
  errors: string[] | null;
}

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
): Promise<void> => {
  try {
    const response = await apiFetch(getApiUrl('/api/Auth/change-password'), {
      method: 'POST',
      body: JSON.stringify({
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
        ConfirmNewPassword: confirmNewPassword,
      } as ChangePasswordRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Password change failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData: ChangePasswordResponse = JSON.parse(errorText);
        if (!errorData.success && errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors.join(', ');
        }
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const result: ChangePasswordResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Password change failed');
    }
  } catch (error: any) {
    console.error('Password change error:', error);
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS is properly configured.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. The API server uses a self-signed certificate. Please accept the certificate in your browser or configure the API to use a trusted certificate.');
    }
    
    throw error;
  }
};
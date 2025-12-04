import { Employee, Department, JobTitle, Company, EmploymentStatus, Gender, CivilStatus } from '@/types';
import { apiFetch } from '@/lib/api';
import { getApiUrl } from '@/lib/config';

const API_BASE_URL = getApiUrl('/api/Employee');

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

interface EmployeeApiResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  birthDate: string;
  gender: number | string;
  civilStatus: number | string;
  phoneNumber: string;
  address: string;
  sssNumber?: string | null;
  philHealthNumber?: string | null;
  pagIbigNumber?: string | null;
  tin?: string | null;
  employeeNumber: string;
  dateHired: string;
  companyId: string;
  departmentId: string;
  jobTitleId: string;
  employmentStatus: number | string;
  avatar?: string | null;
  companyName?: string | null;
  departmentName?: string | null;
  jobTitleName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface EmployeeListApiResponse {
  items: EmployeeApiResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedEmployeesResult {
  items: Employee[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface EmployeePaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface EmployeeInput {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  birthDate: string;
  gender: Gender;
  civilStatus: CivilStatus;
  phoneNumber: string;
  address: string;
  sssNumber?: string;
  philHealthNumber?: string;
  pagIbigNumber?: string;
  tin?: string;
  employeeNumber: string;
  dateHired: string;
  companyId: string;
  departmentId: string;
  jobTitleId: string;
  employmentStatus: EmploymentStatus;
  avatar?: string;
}

// getAuthHeaders is now imported from lib/api

const genderMap: Record<number, Gender> = {
  0: 'Male',
  1: 'Female',
  2: 'Other',
};

const civilStatusMap: Record<number, CivilStatus> = {
  0: 'Single',
  1: 'Married',
  2: 'Divorced',
  3: 'Widowed',
  4: 'Separated',
};

const employmentStatusMap: Record<number, EmploymentStatus> = {
  0: 'Probationary',
  1: 'Regular',
  2: 'Contractual',
  3: 'ProjectBased',
  4: 'Resigned',
  5: 'Terminated',
};

const genderToApiMap: Record<Gender, number> = {
  Male: 0,
  Female: 1,
  Other: 2,
};

const civilStatusToApiMap: Record<CivilStatus, number> = {
  Single: 0,
  Married: 1,
  Divorced: 2,
  Widowed: 3,
  Separated: 4,
};

const employmentStatusToApiMap: Record<EmploymentStatus, number> = {
  Probationary: 0,
  Regular: 1,
  Contractual: 2,
  ProjectBased: 3,
  Resigned: 4,
  Terminated: 5,
};

const normalizeEnumValue = (value: number | string | null | undefined): number | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return isNaN(value) ? undefined : value;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
};

const mapGender = (value: number | string | null | undefined): Gender => {
  const normalized = normalizeEnumValue(value);
  return (normalized !== undefined ? genderMap[normalized] : undefined) || 'Other';
};

const mapCivilStatus = (value: number | string | null | undefined): CivilStatus => {
  const normalized = normalizeEnumValue(value);
  return (normalized !== undefined ? civilStatusMap[normalized] : undefined) || 'Single';
};

const mapEmploymentStatus = (value: number | string | null | undefined): EmploymentStatus => {
  const normalized = normalizeEnumValue(value);
  return (normalized !== undefined ? employmentStatusMap[normalized] : undefined) || 'Probationary';
};

const mapGenderToApi = (value: Gender): number => genderToApiMap[value] ?? genderToApiMap.Other;
const mapCivilStatusToApi = (value: CivilStatus): number => civilStatusToApiMap[value] ?? civilStatusToApiMap.Single;
const mapEmploymentStatusToApi = (value: EmploymentStatus): number =>
  employmentStatusToApiMap[value] ?? employmentStatusToApiMap.Probationary;

const normalizeDateString = (value: string): string => {
  if (!value) {
    return value;
  }
  if (value.includes('T')) {
    return value;
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

const normalizeOptionalString = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const buildEmployeeRequestPayload = (employee: EmployeeInput, id?: string) => {
  const payload: any = {
    UserId: employee.userId,
    FirstName: employee.firstName,
    LastName: employee.lastName,
    Email: employee.email,
    BirthDate: normalizeDateString(employee.birthDate),
    Gender: mapGenderToApi(employee.gender),
    CivilStatus: mapCivilStatusToApi(employee.civilStatus),
    PhoneNumber: employee.phoneNumber,
    Address: employee.address,
    EmployeeNumber: employee.employeeNumber,
    DateHired: normalizeDateString(employee.dateHired),
    CompanyId: employee.companyId,
    DepartmentId: employee.departmentId,
    JobTitleId: employee.jobTitleId,
    EmploymentStatus: mapEmploymentStatusToApi(employee.employmentStatus),
  };

  // Include Id only if provided (for updates)
  if (id) {
    payload.Id = id;
  }

  // Include optional fields only if they have values
  const middleName = normalizeOptionalString(employee.middleName);
  if (middleName !== null) {
    payload.MiddleName = middleName;
  }

  const sssNumber = normalizeOptionalString(employee.sssNumber);
  if (sssNumber !== null) {
    payload.SssNumber = sssNumber;
  }

  const philHealthNumber = normalizeOptionalString(employee.philHealthNumber);
  if (philHealthNumber !== null) {
    payload.PhilHealthNumber = philHealthNumber;
  }

  const pagIbigNumber = normalizeOptionalString(employee.pagIbigNumber);
  if (pagIbigNumber !== null) {
    payload.PagIbigNumber = pagIbigNumber;
  }

  const tin = normalizeOptionalString(employee.tin);
  if (tin !== null) {
    payload.Tin = tin;
  }

  const avatar = normalizeOptionalString(employee.avatar);
  if (avatar !== null) {
    payload.Avatar = avatar;
  }

  return payload;
};

const handleEmployeeApiError = (error: any) => {
  console.error('Employee API error:', error);
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    throw new Error('Unable to connect to the API server. Please check if it is running and that CORS/SSL settings allow requests from the frontend.');
  }
  if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
    throw new Error('SSL certificate error. Visit the API base URL in your browser to trust the certificate or switch to HTTP during development.');
  }
  throw error;
};

const mapEmployeeResponse = (employee: EmployeeApiResponse): Employee => {
  const now = new Date().toISOString();

  return {
    id: employee.id,
    userId: employee.userId,
    employeeNumber: employee.employeeNumber,
    firstName: employee.firstName,
    lastName: employee.lastName,
    middleName: employee.middleName || undefined,
    birthDate: employee.birthDate,
    gender: mapGender(employee.gender),
    civilStatus: mapCivilStatus(employee.civilStatus),
    email: employee.email,
    phoneNumber: employee.phoneNumber,
    address: employee.address,
    sssNumber: employee.sssNumber || undefined,
    philHealthNumber: employee.philHealthNumber || undefined,
    pagIbigNumber: employee.pagIbigNumber || undefined,
    tin: employee.tin || undefined,
    companyId: employee.companyId,
    departmentId: employee.departmentId,
    jobTitleId: employee.jobTitleId,
    dateHired: employee.dateHired,
    employmentStatus: mapEmploymentStatus(employee.employmentStatus),
    avatar: employee.avatar || undefined,
    createdAt: employee.createdAt || now,
    updatedAt: employee.updatedAt || now,
    company: employee.companyName || 'Unknown Company',
    department: employee.departmentName || 'Unknown Department',
    jobTitle: employee.jobTitleName || 'Unknown Job Title',
  };
};

const buildEmployeeQuery = (params?: EmployeePaginationParams) => {
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

// Mock companies
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'TechCorp Philippines',
    description: 'Leading technology company in the Philippines',
    address: 'BGC, Taguig City, Metro Manila, Philippines',
    contactEmail: 'info@techcorp.ph',
    contactPhone: '+63 2 8123 4567',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock departments with company hierarchy
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development and technical operations',
    companyId: 'company-1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Human Resources',
    description: 'Employee management and organizational development',
    companyId: 'company-1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Brand management and customer acquisition',
    companyId: 'company-1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Finance',
    description: 'Financial planning and accounting',
    companyId: 'company-1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Operations',
    description: 'Business operations and process management',
    companyId: 'company-1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock job titles with department hierarchy
export const mockJobTitles: JobTitle[] = [
  { 
    id: '1', 
    title: 'Software Engineer', 
    description: 'Develops and maintains software applications',
    departmentId: '1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '2', 
    title: 'Senior Developer', 
    description: 'Lead developer with advanced technical skills',
    departmentId: '1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '3', 
    title: 'UI/UX Designer', 
    description: 'Designs user interfaces and user experiences',
    departmentId: '1',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '4', 
    title: 'HR Specialist', 
    description: 'Manages human resources operations and employee relations',
    departmentId: '2',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '5', 
    title: 'Marketing Manager', 
    description: 'Oversees marketing strategies and campaigns',
    departmentId: '3',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '6', 
    title: 'Financial Analyst', 
    description: 'Analyzes financial data and provides insights',
    departmentId: '4',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '7', 
    title: 'Operations Manager', 
    description: 'Manages daily business operations and processes',
    departmentId: '5',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '8', 
    title: 'Content Specialist', 
    description: 'Creates and manages content for marketing purposes',
    departmentId: '3',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Updated mock employees with proper hierarchy
export const mockEmployees: Employee[] = [
  {
    id: '1',
    userId: 'user-1',
    employeeNumber: 'EMP001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    middleName: 'Santos',
    birthDate: '1990-05-15',
    gender: 'Male',
    civilStatus: 'Married',
    email: 'juan.delacruz@company.com',
    phoneNumber: '+63 917 123 4567',
    address: '123 Rizal Street, Makati, Metro Manila 1200, Philippines',
    sssNumber: '12-3456789-0',
    philHealthNumber: 'PH123456789',
    pagIbigNumber: 'PG123456789',
    tin: '123-456-789-000',
    companyId: 'company-1',
    departmentId: '1',
    jobTitleId: '1',
    dateHired: '2023-01-15',
    employmentStatus: 'Regular',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    userId: 'user-2',
    employeeNumber: 'EMP002',
    firstName: 'Maria',
    lastName: 'Santos',
    middleName: 'Garcia',
    birthDate: '1992-08-22',
    gender: 'Female',
    civilStatus: 'Single',
    email: 'maria.santos@company.com',
    phoneNumber: '+63 918 234 5678',
    address: '456 Bonifacio Avenue, Quezon City, Metro Manila 1100, Philippines',
    sssNumber: '98-7654321-0',
    philHealthNumber: 'PH987654321',
    pagIbigNumber: 'PG987654321',
    tin: '987-654-321-000',
    companyId: 'company-1',
    departmentId: '2',
    jobTitleId: '4',
    dateHired: '2023-02-01',
    employmentStatus: 'Regular',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2023-02-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  },
  {
    id: '3',
    userId: 'user-3',
    employeeNumber: 'EMP003',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    middleName: 'Mendoza',
    birthDate: '1988-12-10',
    gender: 'Male',
    civilStatus: 'Married',
    email: 'carlos.rodriguez@company.com',
    phoneNumber: '+63 919 345 6789',
    address: '789 EDSA, Pasig, Metro Manila 1600, Philippines',
    sssNumber: '55-5555555-5',
    philHealthNumber: 'PH555555555',
    pagIbigNumber: 'PG555555555',
    tin: '555-555-555-000',
    companyId: 'company-1',
    departmentId: '3',
    jobTitleId: '5',
    dateHired: '2022-11-15',
    employmentStatus: 'Regular',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2022-11-15T08:00:00Z',
    updatedAt: '2023-11-15T08:00:00Z'
  },
  {
    id: '4',
    userId: 'user-4',
    employeeNumber: 'EMP004',
    firstName: 'Ana',
    lastName: 'Reyes',
    middleName: 'Cruz',
    birthDate: '1991-03-18',
    gender: 'Female',
    civilStatus: 'Single',
    email: 'ana.reyes@company.com',
    phoneNumber: '+63 920 456 7890',
    address: '321 Ayala Avenue, Makati, Metro Manila 1226, Philippines',
    sssNumber: '11-1111111-1',
    philHealthNumber: 'PH111111111',
    pagIbigNumber: 'PG111111111',
    tin: '111-111-111-000',
    companyId: 'company-1',
    departmentId: '4',
    jobTitleId: '6',
    dateHired: '2023-03-01',
    employmentStatus: 'Regular',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2023-03-01T08:00:00Z',
    updatedAt: '2024-03-01T08:00:00Z'
  },
  {
    id: '5',
    userId: 'user-5',
    employeeNumber: 'EMP005',
    firstName: 'Miguel',
    lastName: 'Torres',
    middleName: 'Villanueva',
    birthDate: '1989-07-25',
    gender: 'Male',
    civilStatus: 'Divorced',
    email: 'miguel.torres@company.com',
    phoneNumber: '+63 921 567 8901',
    address: '654 Taft Avenue, Manila, Metro Manila 1000, Philippines',
    sssNumber: '22-2222222-2',
    philHealthNumber: 'PH222222222',
    pagIbigNumber: 'PG222222222',
    tin: '222-222-222-000',
    companyId: 'company-1',
    departmentId: '1',
    jobTitleId: '2',
    dateHired: '2022-08-15',
    employmentStatus: 'Regular',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2022-08-15T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z'
  },
  {
    id: '6',
    userId: 'user-6',
    employeeNumber: 'EMP006',
    firstName: 'Isabella',
    lastName: 'Fernandez',
    middleName: 'Lopez',
    birthDate: '1993-11-08',
    gender: 'Female',
    civilStatus: 'Single',
    email: 'isabella.fernandez@company.com',
    phoneNumber: '+63 922 678 9012',
    address: '987 Ortigas Avenue, Pasig, Metro Manila 1605, Philippines',
    sssNumber: '33-3333333-3',
    philHealthNumber: 'PH333333333',
    pagIbigNumber: 'PG333333333',
    tin: '333-333-333-000',
    companyId: 'company-1',
    departmentId: '1',
    jobTitleId: '3',
    dateHired: '2023-06-01',
    employmentStatus: 'Probationary',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2023-06-01T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  },
  {
    id: '7',
    userId: 'user-7',
    employeeNumber: 'EMP007',
    firstName: 'Roberto',
    lastName: 'Gonzales',
    middleName: 'Ramos',
    birthDate: '1987-04-12',
    gender: 'Male',
    civilStatus: 'Married',
    email: 'roberto.gonzales@company.com',
    phoneNumber: '+63 923 789 0123',
    address: '246 Commonwealth Avenue, Quezon City, Metro Manila 1121, Philippines',
    sssNumber: '44-4444444-4',
    philHealthNumber: 'PH444444444',
    pagIbigNumber: 'PG444444444',
    tin: '444-444-444-000',
    companyId: 'company-1',
    departmentId: '5',
    jobTitleId: '7',
    dateHired: '2021-09-20',
    employmentStatus: 'Regular',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2021-09-20T08:00:00Z',
    updatedAt: '2023-12-15T08:00:00Z'
  },
  {
    id: '8',
    userId: 'user-8',
    employeeNumber: 'EMP008',
    firstName: 'Carmen',
    lastName: 'Valdez',
    middleName: 'Morales',
    birthDate: '1994-09-30',
    gender: 'Female',
    civilStatus: 'Single',
    email: 'carmen.valdez@company.com',
    phoneNumber: '+63 924 890 1234',
    address: '135 Shaw Boulevard, Mandaluyong, Metro Manila 1552, Philippines',
    sssNumber: '66-6666666-6',
    philHealthNumber: 'PH666666666',
    pagIbigNumber: 'PG666666666',
    tin: '666-666-666-000',
    companyId: 'company-1',
    departmentId: '3',
    jobTitleId: '8',
    dateHired: '2023-04-15',
    employmentStatus: 'Contractual',
    avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    createdAt: '2023-04-15T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z'
  }
];

// Helper function to get display names
export const getEmployeeDisplayData = (employee: Employee) => {
  const department = mockDepartments.find(d => d.id === employee.departmentId);
  const jobTitle = mockJobTitles.find(jt => jt.id === employee.jobTitleId);
  const company = mockCompanies.find(c => c.id === employee.companyId);
  
  return {
    ...employee,
    department: department?.name || 'Unknown Department',
    jobTitle: jobTitle?.title || 'Unknown Job Title',
    company: company?.name || 'Unknown Company'
  };
};

// Company CRUD operations
export const getCompanies = async (): Promise<Company[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCompanies;
};

export const getCompanyById = async (id: string): Promise<Company | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCompanies.find(company => company.id === id) || null;
};

// Employee CRUD operations
export const getEmployees = async (): Promise<Employee[]> => {
  const paginated = await getEmployeesPaginated({ pageNumber: 1, pageSize: 1000 });
  return paginated.items;
};

export const getEmployeesPaginated = async (
  params?: EmployeePaginationParams
): Promise<PaginatedEmployeesResult> => {
  try {
    const response = await apiFetch(buildEmployeeQuery(params), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch employees: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<EmployeeListApiResponse> = await response.json();

    if (result.success && result.data) {
      return {
        items: result.data.items.map(mapEmployeeResponse),
        totalCount: result.data.totalCount,
        pageNumber: result.data.pageNumber,
        pageSize: result.data.pageSize,
        totalPages: result.data.totalPages,
        hasPrevious: result.data.hasPrevious,
        hasNext: result.data.hasNext,
      };
    }

    throw new Error(result.message || 'Failed to fetch employees');
  } catch (error: any) {
    handleEmployeeApiError(error);
  }
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const employee = mockEmployees.find(emp => emp.id === id);
  return employee ? getEmployeeDisplayData(employee) : null;
};

interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

interface ValidationErrorResponse {
  success: false;
  message: string;
  data: {
    errors: ValidationError[];
  };
  errors: null;
}

export const createEmployee = async (employee: EmployeeInput): Promise<Employee> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(buildEmployeeRequestPayload(employee)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create employee: ${response.status} ${response.statusText}`;
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

    const result: ApiResponse<EmployeeApiResponse> = await response.json();
    if (result.success && result.data) {
      return mapEmployeeResponse(result.data);
    }

    throw new Error(result.message || 'Failed to create employee');
  } catch (error: any) {
    // If it's a validation error, don't call handleEmployeeApiError
    if (error.validationErrors) {
      throw error;
    }
    handleEmployeeApiError(error);
    throw error;
  }
};

export const updateEmployee = async (id: string, updates: EmployeeInput): Promise<Employee> => {
  try {
    const response = await apiFetch(API_BASE_URL, {
      method: 'PUT',
      body: JSON.stringify(buildEmployeeRequestPayload(updates, id)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update employee: ${response.status} ${response.statusText}`;
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
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Log the full error response for debugging
        console.error('Employee update API error response:', errorData);
      } catch (parseError: any) {
        // If it's our validation error, re-throw it
        if (parseError.validationErrors) {
          throw parseError;
        }
        // Otherwise, use the text as error message
        errorMessage = errorText || errorMessage;
        console.error('Employee update API error text:', errorText);
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<EmployeeApiResponse> = await response.json();
    if (result.success && result.data) {
      return mapEmployeeResponse(result.data);
    }

    throw new Error(result.message || 'Failed to update employee');
  } catch (error: any) {
    // If it's a validation error, don't call handleEmployeeApiError
    if (error.validationErrors) {
      throw error;
    }
    handleEmployeeApiError(error);
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete employee: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    handleEmployeeApiError(error);
    throw error;
  }
};

// Department CRUD operations
export const getDepartments = async (): Promise<Department[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockDepartments;
};

export const getDepartmentById = async (id: string): Promise<Department | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockDepartments.find(dept => dept.id === id) || null;
};

export const createDepartment = async (department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newDepartment: Department = {
    ...department,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockDepartments.push(newDepartment);
  return newDepartment;
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = mockDepartments.findIndex(dept => dept.id === id);
  if (index === -1) throw new Error('Department not found');
  
  const updatedDepartment = {
    ...mockDepartments[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  mockDepartments[index] = updatedDepartment;
  return updatedDepartment;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = mockDepartments.findIndex(dept => dept.id === id);
  if (index === -1) throw new Error('Department not found');
  mockDepartments.splice(index, 1);
};

// Employee Document Upload
const EMPLOYEE_DOC_API_URL = getApiUrl('/api/EmployeeDoc');

export interface EmployeeDocumentUpload {
  documentName: string;
  documentType: string;
  documentDescription: string;
  document: File;
  employeeId: string;
}

export interface EmployeeDocumentResponse {
  id: string;
  documentName: string;
  documentType: string;
  documentDescription: string;
  documentPath: string;
  employeeId: string;
  file: null;
  filePath: string;
  fileSize: number;
  uploadedDate: string;
  employeeName: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadEmployeeDocument = async (
  uploadData: EmployeeDocumentUpload
): Promise<EmployeeDocumentResponse> => {
  try {
    const formData = new FormData();
    formData.append('DocumentName', uploadData.documentName);
    formData.append('DocumentType', uploadData.documentType);
    formData.append('DocumentDescription', uploadData.documentDescription);
    formData.append('Document', uploadData.document);
    formData.append('EmployeeId', uploadData.employeeId);

    // Don't set Content-Type for FormData - browser will set it with boundary
    const response = await apiFetch(EMPLOYEE_DOC_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {

      const errorText = await response.text();
      let errorMessage = `Failed to upload document: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<EmployeeDocumentResponse> = await response.json();

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.message || 'Failed to upload document');
  } catch (error: any) {
    console.error('Error uploading document:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS/SSL settings allow requests from the frontend.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. Visit the API base URL in your browser to trust the certificate or switch to HTTP while developing.');
    }
    throw error;
  }
};

export const getEmployeeDocuments = async (employeeId: string): Promise<EmployeeDocumentResponse[]> => {
  try {
    const response = await apiFetch(`${EMPLOYEE_DOC_API_URL}/employee/${employeeId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch employee documents: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<EmployeeDocumentResponse[]> = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || 'Failed to fetch employee documents');
  } catch (error: any) {
    console.error('Error fetching employee documents:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS/SSL settings allow requests from the frontend.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. Visit the API base URL in your browser to trust the certificate or switch to HTTP while developing.');
    }
    throw error;
  }
};

export const deleteEmployeeDocument = async (documentId: string): Promise<void> => {
  try {
    const response = await apiFetch(`${EMPLOYEE_DOC_API_URL}/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete employee document: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<null> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete employee document');
    }
  } catch (error: any) {
    console.error('Error deleting employee document:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to the API server. Please check if the server is running and that CORS/SSL settings allow requests from the frontend.');
    }
    if (error.message?.includes('certificate') || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      throw new Error('SSL certificate error. Visit the API base URL in your browser to trust the certificate or switch to HTTP while developing.');
    }
    throw error;
  }
};
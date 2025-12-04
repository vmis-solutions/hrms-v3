export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  companyId?: string;
  avatar?: string;
}

export type UserRole = 'HR_MANAGER' | 'HR_SUPERVISOR' | 'HR_COMPANY' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';

export interface SystemUser {
  id: string;
  userName: string;
  email: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  employeeNumber: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  departments?: Department[];
}

export interface Employee {
  id: string;
  userId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  gender: Gender;
  civilStatus: CivilStatus;
  
  // Contact Info
  email: string;
  phoneNumber: string;
  address: string;
  
  // Government IDs
  sssNumber?: string;
  philHealthNumber?: string;
  pagIbigNumber?: string;
  tin?: string;
  
  // Employment Info (following hierarchy)
  employeeNumber: string;
  dateHired: string;
  companyId: string;
  departmentId: string;
  jobTitleId: string;
  employmentStatus: EmploymentStatus;
  company?: string;
  department?: string;
  jobTitle?: string;
  
  // Additional fields
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  
  // Navigation Properties (for future use)
  leaveApplications?: LeaveApplication[];
  attendances?: Attendance[];
  payrolls?: Payroll[];
}

export type Gender = 'Male' | 'Female' | 'Other';

export type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

export type EmploymentStatus = 'Probationary' | 'Regular' | 'Contractual' | 'ProjectBased' | 'Resigned' | 'Terminated';

export interface LeaveDay {
  date: string;
  isPaid: boolean;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  paidDays: number; // Number of days that are paid
  unpaidDays: number; // Number of days that are unpaid
  leaveDays: LeaveDay[]; // Detailed breakdown of each day
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  
  // Approval workflow
  departmentHeadApproval?: {
    approvedBy: string;
    approvedDate: string;
    comments?: string;
  };
  hrAcknowledgment?: {
    acknowledgedBy: string;
    acknowledgedDate: string;
    comments?: string;
  };
  
  // Navigation properties
  employee?: Employee;
  departmentHead?: Employee;
  hrPersonnel?: Employee;
  
  createdAt: string;
  updatedAt: string;
}

export type LeaveType = 'Vacation' | 'Sick' | 'Emergency' | 'Paternity' | 'Maternity' | 'Bereavement' | 'Personal';

export type LeaveStatus = 'Pending' | 'Approved_by_Department' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveBalance {
  id: string;
  employeeId: string;
  year: number;
  totalPaidLeave: number; // Total paid leave allocation (e.g., 5)
  usedPaidLeave: number; // Used paid leave count
  employee?: Employee;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  totalHours: number;
  employee?: Employee;
}

export interface Payroll {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  basicPay: number;
  allowances: number;
  deductions: number;
  netPay: number;
  employee?: Employee;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  headId?: string;
  headEmployeeId?: string | null;
  createdAt: string;
  updatedAt: string;
  companyName?: string;
  employeeCount?: number;
  hrManagers?: { id?: string; name?: string; email?: string }[];
  company?: Company;
  employees?: Employee[];
  jobTitles?: JobTitle[];
}

export interface JobTitle {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
  departmentName?: string;
  companyName?: string;
  department?: Department;
  employees?: Employee[];
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
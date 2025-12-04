'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Sidebar from '@/components/layout/Sidebar';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UpcomingBirthdays from '@/components/dashboard/UpcomingBirthdays';
import EmployeeList from '@/components/employees/EmployeeList';
import EmployeeProfile from '@/components/employees/EmployeeProfile';
import EmployeeForm from '@/components/employees/EmployeeForm';
import DepartmentList from '@/components/departments/DepartmentList';
import DepartmentForm from '@/components/departments/DepartmentForm';
import DepartmentHRAssignment from '@/components/departments/DepartmentHRAssignment';
import CompanyList from '@/components/companies/CompanyList';
import CompanyForm from '@/components/companies/CompanyForm';
import JobTitleList from '@/components/jobtitles/JobTitleList';
import JobTitleForm from '@/components/jobtitles/JobTitleForm';
import UserList from '@/components/users/UserList';
import UserForm from '@/components/users/UserForm';
import LeaveApplicationList from '@/components/leaves/LeaveApplicationList';
import LeaveApplicationForm from '@/components/leaves/LeaveApplicationForm';
import LeaveApplicationDetail from '@/components/leaves/LeaveApplicationDetail';
import MyProfile from '@/components/profile/MyProfile';
import { Employee, Department, Company, JobTitle, LeaveApplication, SystemUser } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function Dashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditingDepartment, setIsEditingDepartment] = useState(false);
  const [isAssigningHRManagers, setIsAssigningHRManagers] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitle | null>(null);
  const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [isEditingLeave, setIsEditingLeave] = useState(false);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditingEmployee(false);
  };

  const handleEmployeeEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditingEmployee(true);
  };

  const handleEmployeeAdd = () => {
    setSelectedEmployee(null);
    setIsEditingEmployee(true);
  };

  const handleEmployeeBackToList = () => {
    setSelectedEmployee(null);
    setIsEditingEmployee(false);
  };

  const handleEmployeeSave = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditingEmployee(false);
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditingDepartment(false);
  };

  const handleDepartmentEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditingDepartment(true);
  };

  const handleDepartmentAdd = () => {
    setSelectedDepartment(null);
    setIsEditingDepartment(true);
  };

  const handleDepartmentBackToList = () => {
    setSelectedDepartment(null);
    setIsEditingDepartment(false);
  };

  const handleDepartmentSave = (department: Department) => {
    setSelectedDepartment(null);
    setIsEditingDepartment(false);
  };

  const handleAssignHRManagers = () => {
    setIsAssigningHRManagers(true);
  };

  const handleHRAssignmentBack = () => {
    setIsAssigningHRManagers(false);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsEditingCompany(false);
  };

  const handleCompanyEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsEditingCompany(true);
  };

  const handleCompanyAdd = () => {
    setSelectedCompany(null);
    setIsEditingCompany(true);
  };

  const handleCompanyBackToList = () => {
    setSelectedCompany(null);
    setIsEditingCompany(false);
  };

  const handleCompanySave = (company: Company) => {
    setSelectedCompany(company);
    setIsEditingCompany(false);
  };

  const handleJobTitleSelect = (jobTitle: JobTitle) => {
    setSelectedJobTitle(jobTitle);
    setIsEditingJobTitle(false);
  };

  const handleJobTitleEdit = (jobTitle: JobTitle) => {
    setSelectedJobTitle(jobTitle);
    setIsEditingJobTitle(true);
  };

  const handleJobTitleAdd = () => {
    setSelectedJobTitle(null);
    setIsEditingJobTitle(true);
  };

  const handleJobTitleBackToList = () => {
    setSelectedJobTitle(null);
    setIsEditingJobTitle(false);
  };

  const handleJobTitleSave = (jobTitle: JobTitle) => {
    setSelectedJobTitle(null);
    setIsEditingJobTitle(false);
    toast.success(`${jobTitle.title} saved successfully`);
  };

  const handleUserSelect = (user: SystemUser) => {
    setSelectedUser(user);
    setIsEditingUser(false);
  };

  const handleUserEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setIsEditingUser(true);
  };

  const handleUserAdd = () => {
    setSelectedUser(null);
    setIsEditingUser(true);
  };

  const handleUserBackToList = () => {
    setSelectedUser(null);
    setIsEditingUser(false);
  };

  const handleUserSave = (user: SystemUser) => {
    setSelectedUser(null);
    setIsEditingUser(false);
    toast.success(`User ${user.userName} saved successfully`);
  };

  const handleLeaveSelect = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setIsEditingLeave(false);
  };

  const handleLeaveEdit = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setIsEditingLeave(true);
  };

  const handleLeaveAdd = () => {
    setSelectedLeave(null);
    setIsEditingLeave(true);
  };

  const handleLeaveBackToList = () => {
    setSelectedLeave(null);
    setIsEditingLeave(false);
  };

  const handleLeaveSave = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setIsEditingLeave(false);
  };

  const handleLeaveUpdate = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading HRMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (activeTab === 'employees') {
      if (isEditingEmployee) {
        return (
          <EmployeeForm
            employee={selectedEmployee || undefined}
            onBack={handleEmployeeBackToList}
            onSave={handleEmployeeSave}
          />
        );
      }
      
      if (selectedEmployee && !isEditingEmployee) {
        return (
          <EmployeeProfile
            employee={selectedEmployee}
            onBack={handleEmployeeBackToList}
            onEdit={handleEmployeeEdit}
          />
        );
      }

      return (
        <EmployeeList
          onEmployeeSelect={handleEmployeeSelect}
          onEmployeeEdit={handleEmployeeEdit}
          onEmployeeAdd={handleEmployeeAdd}
        />
      );
    }

    if (activeTab === 'leaves') {
      if (isEditingLeave) {
        return (
          <LeaveApplicationForm
            leaveApplication={selectedLeave || undefined}
            onBack={handleLeaveBackToList}
            onSave={handleLeaveSave}
          />
        );
      }
      
      if (selectedLeave && !isEditingLeave) {
        return (
          <LeaveApplicationDetail
            leaveApplication={selectedLeave}
            onBack={handleLeaveBackToList}
            onEdit={handleLeaveEdit}
            onUpdate={handleLeaveUpdate}
          />
        );
      }

      return (
        <LeaveApplicationList
          onLeaveSelect={handleLeaveSelect}
          onLeaveEdit={handleLeaveEdit}
          onLeaveAdd={handleLeaveAdd}
        />
      );
    }

    if (activeTab === 'companies') {
      if (isEditingCompany) {
        return (
          <CompanyForm
            company={selectedCompany || undefined}
            onBack={handleCompanyBackToList}
            onSave={handleCompanySave}
          />
        );
      }
      
      if (selectedCompany && !isEditingCompany) {
        // TODO: Implement CompanyProfile component
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleCompanyBackToList} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Company Details</h2>
                <p className="text-gray-600">View company information</p>
              </div>
            </div>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Company profile view will be implemented in the next update.</h3>
              <p className="text-gray-500">Company: {selectedCompany.name}</p>
            </div>
          </div>
        );
      }

      return (
        <CompanyList
          onCompanySelect={handleCompanySelect}
          onCompanyEdit={handleCompanyEdit}
          onCompanyAdd={handleCompanyAdd}
        />
      );
    }

    if (activeTab === 'departments') {
      if (isAssigningHRManagers) {
        return (
          <DepartmentHRAssignment
            onBack={handleHRAssignmentBack}
          />
        );
      }

      if (isEditingDepartment) {
        return (
          <DepartmentForm
            department={selectedDepartment || undefined}
            onBack={handleDepartmentBackToList}
            onSave={handleDepartmentSave}
          />
        );
      }
      
      if (selectedDepartment && !isEditingDepartment) {
        // TODO: Implement DepartmentProfile component
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Department Details</h3>
            <p className="text-gray-500">Department profile view will be implemented in the next update.</p>
          </div>
        );
      }

      return (
        <DepartmentList
          onDepartmentSelect={handleDepartmentSelect}
          onDepartmentEdit={handleDepartmentEdit}
          onDepartmentAdd={handleDepartmentAdd}
          onAssignHRManagers={handleAssignHRManagers}
        />
      );
    }

    if (activeTab === 'job-titles') {
      if (isEditingJobTitle) {
        return (
          <JobTitleForm
            jobTitle={selectedJobTitle || undefined}
            onBack={handleJobTitleBackToList}
            onSave={handleJobTitleSave}
          />
        );
      }
      
      if (selectedJobTitle && !isEditingJobTitle) {
        // TODO: Implement JobTitleProfile component
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job Title Details</h3>
            <p className="text-gray-500">Job title profile view will be implemented in the next update.</p>
          </div>
        );
      }

      return (
        <JobTitleList
          onJobTitleSelect={handleJobTitleSelect}
          onJobTitleEdit={handleJobTitleEdit}
          onJobTitleAdd={handleJobTitleAdd}
        />
      );
    }

    if (activeTab === 'users') {
      if (isEditingUser) {
        return (
          <UserForm
            user={selectedUser || undefined}
            onBack={handleUserBackToList}
            onSave={handleUserSave}
          />
        );
      }
      
      if (selectedUser && !isEditingUser) {
        // TODO: Implement UserProfile component
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleUserBackToList} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <p className="text-gray-600">View user information</p>
              </div>
            </div>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">User profile view will be implemented in the next update.</h3>
              <p className="text-gray-500">User: {selectedUser.userName}</p>
            </div>
          </div>
        );
      }

      return (
        <UserList
          onUserSelect={handleUserSelect}
          onUserEdit={handleUserEdit}
          onUserAdd={handleUserAdd}
        />
      );
    }

    if (activeTab === 'my-profile') {
      return <MyProfile />;
    }

    if (activeTab === 'reports') {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
          <p className="text-gray-500">Reports and analytics will be implemented in the next update.</p>
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-500">Settings panel will be implemented in the next update.</p>
        </div>
      );
    }

    // Dashboard
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your team today.
          </p>
        </div>
        
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity />
          <div className="space-y-6">
            {/* Upcoming Birthdays */}
            <UpcomingBirthdays />
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('leaves')}
                  className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors"
                >
                  → Apply for Leave
                </button>
                <button 
                  onClick={() => setActiveTab('employees')}
                  className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded transition-colors"
                >
                  → View All Employees
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('employees');
                    handleEmployeeAdd();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded transition-colors"
                >
                  → Add New Employee
                </button>
                <button 
                  onClick={() => setActiveTab('departments')}
                  className="w-full text-left px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-100 rounded transition-colors"
                >
                  → Manage Departments
                </button>
                <button 
                  onClick={() => setActiveTab('job-titles')}
                  className="w-full text-left px-3 py-2 text-sm text-pink-700 hover:bg-pink-100 rounded transition-colors"
                >
                  → Manage Job Titles
                </button>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-100 rounded transition-colors"
                >
                  → Generate Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2,
  Building, 
  Users, 
  User, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Home,
  UserPlus,
  BarChart3,
  Briefcase,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleDisplayName, canAccessEmployeeManagement, canManageDepartments, canManageJobTitles, canManageCompany, canManageUsers } from '@/lib/auth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      available: true
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      available: canAccessEmployeeManagement(user.role)
    },
    {
      id: 'leaves',
      label: 'Leave Management',
      icon: CalendarDays,
      available: true // All users can access leave management
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Building,
      available: canManageCompany(user.role)
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      available: canManageDepartments(user.role)
    },
    {
      id: 'job-titles',
      label: 'Job Titles',
      icon: Briefcase,
      available: canManageJobTitles(user.role)
    },
    {
      id: 'users',
      label: 'Users',
      icon: UserPlus,
      available: canManageUsers(user.role)
    },
    {
      id: 'my-profile',
      label: 'My Profile',
      icon: User,
      available: true
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      available: user.role === 'HR_MANAGER' || user.role === 'HR_SUPERVISOR'
    }
  ].filter(item => item.available);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">HRMS</h2>
            <p className="text-sm text-gray-500">Philippines</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.firstName} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {getRoleDisplayName(user.role)}
            </p>
            {user.department && (
              <p className="text-xs text-gray-400 truncate">
                {user.department}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start h-11',
                activeTab === item.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={() => onTabChange('settings')}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
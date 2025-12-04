'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Save, 
  User,
  Mail,
  Lock,
  Users,
  Loader2,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { SystemUser, Employee } from '@/types';
import { createUser, updateUser, UserInput } from '@/lib/users';
import { getEmployees } from '@/lib/employees';
import { toast } from 'sonner';

interface UserFormProps {
  user?: SystemUser;
  onBack: () => void;
  onSave: (user: SystemUser) => void;
}

type UserFormState = {
  userName: string;
  email: string;
  password: string;
  employeeId: string;
};

export default function UserForm({ user, onBack, onSave }: UserFormProps) {
  const initialState: UserFormState = {
    userName: '',
    email: '',
    password: '',
    employeeId: '',
  };

  const [formData, setFormData] = useState<UserFormState>(initialState);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormState, string>>>({});
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const employeeList = await getEmployees();
        setEmployees(employeeList);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName,
        email: user.email,
        password: '',
        employeeId: user.employeeId,
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setFormData(prev => ({ ...prev, employeeId: employee.id }));
    setEmployeeSearchOpen(false);
    setEmployeeSearchQuery('');
    if (errors.employeeId) {
      setErrors(prev => ({ ...prev, employeeId: undefined }));
    }
  };

  const getSelectedEmployee = () => {
    return employees.find(emp => emp.id === formData.employeeId);
  };

  const getEmployeeDisplayName = (employee: Employee) => {
    const middleInitial = employee.middleName ? ` ${employee.middleName[0]}.` : '';
    return `${employee.firstName}${middleInitial} ${employee.lastName} (${employee.employeeNumber})`;
  };

  const filteredEmployees = employees.filter(employee => {
    if (!employeeSearchQuery) return true;
    const searchLower = employeeSearchQuery.toLowerCase();
    const fullName = `${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      employee.employeeNumber.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower)
    );
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormState, string>> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const userInput: UserInput = {
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        employeeId: formData.employeeId,
      };

      let savedUser: SystemUser;
      if (user) {
        // Update existing user
        savedUser = await updateUser(user.id, userInput);
        toast.success('User updated successfully');
      } else {
        // Create new user
        savedUser = await createUser(userInput);
        toast.success('User created successfully');
      }
      onSave(savedUser);
    } catch (error: any) {
      console.error(`Error ${user ? 'updating' : 'creating'} user:`, error);
      
      // Handle validation errors from API
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        const validationErrors: Partial<Record<keyof UserFormState, string>> = {};
        error.validationErrors.forEach((err: any) => {
          if (err.field && err.message) {
            // Map API field names to form field names (e.g., "UserName" -> "userName", "Email" -> "email")
            const fieldMap: Record<string, keyof UserFormState> = {
              'UserName': 'userName',
              'Email': 'email',
              'Password': 'password',
              'EmployeeId': 'employeeId',
            };
            const formField = fieldMap[err.field] || err.field.toLowerCase() as keyof UserFormState;
            validationErrors[formField] = err.message;
          }
        });
        setErrors(validationErrors);
        toast.error(error.message || 'Validation failed. Please check the form for errors.');
      } else {
        // Handle other errors
        const errorMessage = error.message || `Failed to ${user ? 'update' : 'create'} user`;
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = getSelectedEmployee();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <p className="text-gray-600">
            {user ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="userName">Username *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="userName"
                  type="text"
                  value={formData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  className={cn('pl-10', errors.userName && 'border-red-500')}
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
              {errors.userName && (
                <p className="text-sm text-red-600">{errors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn('pl-10', errors.email && 'border-red-500')}
                  placeholder="Enter email address"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {user ? '(leave blank to keep current)' : '*'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn('pl-10 pr-10', errors.password && 'border-red-500')}
                  placeholder={user ? "Enter new password (optional)" : "Enter password"}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeeSearchOpen}
                    className={cn(
                      'w-full justify-between',
                      errors.employeeId && 'border-red-500',
                      !selectedEmployee && 'text-muted-foreground'
                    )}
                    disabled={loading || loadingEmployees || !!user}
                  >
                    {loadingEmployees ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading employees...
                      </span>
                    ) : selectedEmployee ? (
                      getEmployeeDisplayName(selectedEmployee)
                    ) : (
                      'Select employee...'
                    )}
                    <ChevronsUpDown className={cn('ml-2 h-4 w-4 shrink-0 opacity-50', user && 'hidden')} />
                  </Button>
                </PopoverTrigger>
                {!user && (
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search employees by name, number, or email..."
                        value={employeeSearchQuery}
                        onValueChange={setEmployeeSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingEmployees ? 'Loading employees...' : 'No employee found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredEmployees.map((employee) => (
                            <CommandItem
                              key={employee.id}
                              value={employee.id}
                              onSelect={() => handleEmployeeSelect(employee)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.employeeId === employee.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {getEmployeeDisplayName(employee)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {employee.email} • {employee.department || 'No department'}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
              {errors.employeeId && (
                <p className="text-sm text-red-600">{errors.employeeId}</p>
              )}
              {selectedEmployee && (
                <p className="text-xs text-gray-500">
                  Selected: {selectedEmployee.firstName} {selectedEmployee.lastName} ({selectedEmployee.employeeNumber})
                </p>
              )}
              {user && (
                <p className="text-xs text-gray-500 italic">
                  Employee cannot be changed when editing a user
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {user ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {user ? 'Update User' : 'Create User'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


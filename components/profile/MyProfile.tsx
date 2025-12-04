'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  Eye,
  EyeOff,
  Key,
  Bell,
  Globe,
  Briefcase,
  Heart,
  Cake,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Employee, Gender, CivilStatus } from '@/types';
import { getEmployeeById, updateEmployee, EmployeeInput } from '@/lib/employees';
import { getJobTitles } from '@/lib/jobTitles';
import { getDepartments } from '@/lib/departments';
import { getRoleDisplayName, changePassword } from '@/lib/auth';
import { toast } from 'sonner';

export default function MyProfile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    gender: '' as Gender | '',
    civilStatus: '' as CivilStatus | '',
    
    // Contact Info
    email: '',
    phoneNumber: '',
    address: '',
    
    // Government IDs
    sssNumber: '',
    philHealthNumber: '',
    pagIbigNumber: '',
    tin: '',
    
    // Account Settings
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Privacy Settings
    profileVisibility: 'company',
    showContactInfo: true,
    showBirthDate: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      // For demo purposes, we'll find an employee that matches the user's email
      const [employeeData, departmentsData, jobTitlesData] = await Promise.all([
        // In a real app, you'd have a user-to-employee mapping
        getEmployeeById('1'), // Mock employee ID
        getDepartments(),
        getJobTitles()
      ]);
      
      if (employeeData) {
        setEmployee(employeeData);
        setFormData(prev => ({
          ...prev,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          middleName: employeeData.middleName || '',
          birthDate: employeeData.birthDate,
          gender: employeeData.gender,
          civilStatus: employeeData.civilStatus,
          email: employeeData.email,
          phoneNumber: employeeData.phoneNumber,
          address: employeeData.address,
          sssNumber: employeeData.sssNumber || '',
          philHealthNumber: employeeData.philHealthNumber || '',
          pagIbigNumber: employeeData.pagIbigNumber || '',
          tin: employeeData.tin || ''
        }));
      }
      
      setDepartments(departmentsData.map(d => d.name));
      setJobTitles(jobTitlesData.map(j => j.title));
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only if changing password)
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !employee) return;

    setSaving(true);
    try {
      // Update employee profile
      const employeePayload: EmployeeInput = {
        userId: employee.userId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        birthDate: formData.birthDate,
        gender: (formData.gender || employee.gender) as Gender,
        civilStatus: (formData.civilStatus || employee.civilStatus) as CivilStatus,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        sssNumber: formData.sssNumber.trim() || undefined,
        philHealthNumber: formData.philHealthNumber.trim() || undefined,
        pagIbigNumber: formData.pagIbigNumber.trim() || undefined,
        tin: formData.tin.trim() || undefined,
        employeeNumber: employee.employeeNumber,
        dateHired: employee.dateHired,
        companyId: employee.companyId,
        departmentId: employee.departmentId,
        jobTitleId: employee.jobTitleId,
        employmentStatus: employee.employmentStatus,
        avatar: employee.avatar,
      };

      const updatedEmployee = await updateEmployee(employee.id, employeePayload);
      
      // Change password if new password is provided
      if (formData.newPassword && formData.currentPassword) {
        try {
          await changePassword(
            formData.currentPassword,
            formData.newPassword,
            formData.confirmNewPassword
          );
          toast.success('Password changed successfully');
        } catch (passwordError: any) {
          console.error('Error changing password:', passwordError);
          toast.error(passwordError.message || 'Failed to change password');
          // Still update the employee profile even if password change fails
        }
      }
      
      setEmployee(updatedEmployee);
      setEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateTenure = (hireDate: string) => {
    const today = new Date();
    const hired = new Date(hireDate);
    const diffTime = Math.abs(today.getTime() - hired.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!employee || !user) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-500">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {editing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {employee.firstName} {employee.middleName && `${employee.middleName} `}{employee.lastName}
                      </h3>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium">{employee.jobTitle}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{employee.department}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Employee ID:</span>
                        <span className="font-medium">{employee.employeeNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Tenure:</span>
                        <span className="font-medium">{calculateTenure(employee.dateHired)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personal Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!editing}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!editing}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange('gender', value)}
                        disabled={!editing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="civilStatus">Civil Status</Label>
                      <Select
                        value={formData.civilStatus}
                        onValueChange={(value) => handleInputChange('civilStatus', value)}
                        disabled={!editing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select civil status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                          <SelectItem value="Separated">Separated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!editing}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        disabled={!editing}
                        className={errors.phoneNumber ? 'border-red-500' : ''}
                      />
                      {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!editing}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateAge(employee.birthDate)}
                    </div>
                    <p className="text-sm text-gray-600">Years Old</p>
                  </div>
                  <Separator />
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {calculateTenure(employee.dateHired).split(',')[0]}
                    </div>
                    <p className="text-sm text-gray-600">With Company</p>
                  </div>
                  <Separator />
                  <div className="text-center space-y-2">
                    <div className="text-lg font-bold text-purple-600">
                      {employee.employmentStatus}
                    </div>
                    <p className="text-sm text-gray-600">Employment Status</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Employment Information Tab */}
        <TabsContent value="employment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Employment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee ID:</span>
                    <p className="font-medium">{employee.employeeNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Hired:</span>
                    <p className="font-medium">{formatDate(employee.dateHired)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Job Title:</span>
                    <p className="font-medium">{employee.jobTitle}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Employment Status:</span>
                    <p className="font-medium">{employee.employmentStatus}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Company Tenure:</span>
                    <p className="font-medium">{calculateTenure(employee.dateHired)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Government IDs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sssNumber">SSS Number</Label>
                  <Input
                    id="sssNumber"
                    value={formData.sssNumber}
                    onChange={(e) => handleInputChange('sssNumber', e.target.value)}
                    disabled={!editing}
                    placeholder="12-3456789-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="philHealthNumber">PhilHealth Number</Label>
                  <Input
                    id="philHealthNumber"
                    value={formData.philHealthNumber}
                    onChange={(e) => handleInputChange('philHealthNumber', e.target.value)}
                    disabled={!editing}
                    placeholder="PH123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pagIbigNumber">Pag-IBIG Number</Label>
                  <Input
                    id="pagIbigNumber"
                    value={formData.pagIbigNumber}
                    onChange={(e) => handleInputChange('pagIbigNumber', e.target.value)}
                    disabled={!editing}
                    placeholder="PG123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin">TIN</Label>
                  <Input
                    id="tin"
                    value={formData.tin}
                    onChange={(e) => handleInputChange('tin', e.target.value)}
                    disabled={!editing}
                    placeholder="123-456-789-000"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Change Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      disabled={!editing}
                      className={errors.currentPassword ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    disabled={!editing}
                    className={errors.newPassword ? 'border-red-500' : ''}
                  />
                  {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmNewPassword}
                    onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                    disabled={!editing}
                    className={errors.confirmNewPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmNewPassword && <p className="text-sm text-red-600">{errors.confirmNewPassword}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                    disabled={!editing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={formData.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                    disabled={!editing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={formData.pushNotifications}
                    onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                    disabled={!editing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={formData.profileVisibility}
                    onValueChange={(value) => handleInputChange('profileVisibility', value)}
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="company">Company Only</SelectItem>
                      <SelectItem value="department">Department Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Contact Information</Label>
                    <p className="text-sm text-gray-500">Allow others to see your contact details</p>
                  </div>
                  <Switch
                    checked={formData.showContactInfo}
                    onCheckedChange={(checked) => handleInputChange('showContactInfo', checked)}
                    disabled={!editing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Birth Date</Label>
                    <p className="text-sm text-gray-500">Allow others to see your birth date</p>
                  </div>
                  <Switch
                    checked={formData.showBirthDate}
                    onCheckedChange={(checked) => handleInputChange('showBirthDate', checked)}
                    disabled={!editing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
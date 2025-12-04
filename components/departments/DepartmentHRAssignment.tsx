'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Building,
  Loader2,
  UserPlus,
  X,
  Search,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Department, Employee } from '@/types';
import { assignHRManagersToDepartment, getManagedDepartments } from '@/lib/departments';
import { getEmployeesPaginated } from '@/lib/employees';
import { toast } from 'sonner';

interface DepartmentHRAssignmentProps {
  onBack: () => void;
}

export default function DepartmentHRAssignment({ onBack }: DepartmentHRAssignmentProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(1000); // Large page size to get all employees
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [pageNumber, appliedSearch]);

  useEffect(() => {
    if (selectedDepartmentId) {
      const department = departments.find(d => d.id === selectedDepartmentId);
      if (department?.hrManagers && department.hrManagers.length > 0) {
        const existingHRIds = department.hrManagers
          .map(hr => hr.id)
          .filter((id): id is string => id !== undefined);
        setSelectedEmployeeIds(existingHRIds);
      } else {
        setSelectedEmployeeIds([]);
      }
    }
  }, [selectedDepartmentId, departments]);

  const loadDepartments = async () => {
    try {
      const departmentsData = await getManagedDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const result = await getEmployeesPaginated({
        pageNumber,
        pageSize,
        search: appliedSearch || undefined
      });
      setEmployees(result.items);
      setPaginationInfo({
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasPrevious: result.hasPrevious,
        hasNext: result.hasNext
      });
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSearch = () => {
    setPageNumber(1);
    setAppliedSearch(searchTerm.trim());
  };

  const handleAddEmployee = (employeeId: string) => {
    if (!selectedEmployeeIds.includes(employeeId)) {
      setSelectedEmployeeIds([...selectedEmployeeIds, employeeId]);
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== employeeId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDepartmentId) {
      toast.error('Please select a department');
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      toast.error('Please select at least one HR manager');
      return;
    }

    setLoading(true);
    try {
      await assignHRManagersToDepartment(selectedDepartmentId, selectedEmployeeIds);
      toast.success('HR managers assigned successfully');
      
      // Reload departments to get updated HR managers
      await loadDepartments();
      
      // Reset form
      setSelectedDepartmentId('');
      setSelectedEmployeeIds([]);
    } catch (error) {
      console.error('Error assigning HR managers:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign HR managers');
    } finally {
      setLoading(false);
    }
  };

  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);
  
  // Filter out already selected employees
  const availableEmployees = employees.filter(
    emp => !selectedEmployeeIds.includes(emp.id)
  );

  const selectedEmployees = employees.filter(
    emp => selectedEmployeeIds.includes(emp.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assign HR Managers to Department</h2>
          <p className="text-gray-600">Assign HR managers to manage specific departments</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>HR Manager Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department *</Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={setSelectedDepartmentId}
                  disabled={loadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select a department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(department => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name} {department.companyName && `(${department.companyName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current HR Managers */}
              {selectedDepartment && selectedDepartment.hrManagers && selectedDepartment.hrManagers.length > 0 && (
                <div className="space-y-2">
                  <Label>Current HR Managers</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                    {selectedDepartment.hrManagers.map((hr, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {hr.name || hr.email || 'HR Manager'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected HR Managers */}
              {selectedEmployeeIds.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected HR Managers</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                    {selectedEmployees.map(employee => (
                      <Badge key={employee.id} variant="default" className="text-sm flex items-center gap-1">
                        {employee.firstName} {employee.lastName}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmployee(employee.id)}
                          className="ml-1 hover:bg-blue-600 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Search and Selection */}
              {selectedDepartmentId && (
                <div className="space-y-2">
                  <Label htmlFor="employeeSearch">Search and Select HR Managers</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="employeeSearch"
                        placeholder="Search employees by name, email, or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSearch}
                      disabled={loadingEmployees}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Search
                    </Button>
                  </div>
                  
                  {loadingEmployees ? (
                    <div className="p-4 text-center text-gray-500 text-sm border rounded-md mt-2">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Loading employees...
                    </div>
                  ) : availableEmployees.length > 0 ? (
                    <>
                      <div className="max-h-60 overflow-y-auto border rounded-md mt-2">
                        {availableEmployees.map(employee => (
                          <div
                            key={employee.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                            onClick={() => handleAddEmployee(employee.id)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {employee.firstName} {employee.middleName && `${employee.middleName[0]}.`} {employee.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.email} {employee.jobTitle && `• ${employee.jobTitle}`}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddEmployee(employee.id);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {paginationInfo.totalPages > 1 && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                          <span>
                            Showing {availableEmployees.length} of {paginationInfo.totalCount} employees
                            {appliedSearch && ` · Search: "${appliedSearch}"`}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                              disabled={!paginationInfo.hasPrevious || loadingEmployees}
                            >
                              Previous
                            </Button>
                            <span className="px-2 py-1">
                              Page {pageNumber} of {paginationInfo.totalPages}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPageNumber(prev => prev + 1)}
                              disabled={!paginationInfo.hasNext || loadingEmployees}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm border rounded-md mt-2">
                      {appliedSearch 
                        ? `No employees found matching "${appliedSearch}"`
                        : 'No employees available'}
                    </div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !selectedDepartmentId || selectedEmployeeIds.length === 0} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Assign HR Managers
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


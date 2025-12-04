'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Building,
  Users,
  UserCheck,
  UserPlus,
  Mail,
  Loader2,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Department } from '@/types';
import { deleteDepartment } from '@/lib/employees';
import { getManagedDepartments, getDepartmentHRManagers, deleteDepartmentHRManager, DepartmentHRManager } from '@/lib/departments';
import { useAuth } from '@/contexts/AuthContext';
import { canEditEmployee, canDeleteEmployee } from '@/lib/auth';
import { toast } from 'sonner';

interface DepartmentListProps {
  onDepartmentSelect: (department: Department) => void;
  onDepartmentEdit: (department: Department) => void;
  onDepartmentAdd: () => void;
  onAssignHRManagers?: () => void;
}

export default function DepartmentList({ 
  onDepartmentSelect, 
  onDepartmentEdit, 
  onDepartmentAdd,
  onAssignHRManagers
}: DepartmentListProps) {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hrManagers, setHrManagers] = useState<Record<string, DepartmentHRManager[]>>({});
  const [loadingHRManagers, setLoadingHRManagers] = useState<Record<string, boolean>>({});
  const [deletingHRManager, setDeletingHRManager] = useState<string | null>(null);
  const [hrManagerDeleteDialogOpen, setHrManagerDeleteDialogOpen] = useState(false);
  const [hrManagerToDelete, setHrManagerToDelete] = useState<{ hrManager: DepartmentHRManager; departmentId: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    // Load HR managers for all departments that haven't been loaded yet
    if (departments.length > 0) {
      departments.forEach(department => {
        // Only load if not already loaded or loading
        if (!hrManagers[department.id] && !loadingHRManagers[department.id]) {
          loadHRManagersForDepartment(department.id);
        }
      });
    }
  }, [departments]);

  const loadDepartments = async () => {
    try {
      const departmentsData = await getManagedDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadHRManagersForDepartment = async (departmentId: string) => {
    setLoadingHRManagers(prev => ({ ...prev, [departmentId]: true }));
    try {
      const hrManagersData = await getDepartmentHRManagers(departmentId);
      setHrManagers(prev => ({ ...prev, [departmentId]: hrManagersData }));
    } catch (error) {
      console.error(`Error loading HR managers for department ${departmentId}:`, error);
      // Don't show toast for each department, just log the error
      setHrManagers(prev => ({ ...prev, [departmentId]: [] }));
    } finally {
      setLoadingHRManagers(prev => ({ ...prev, [departmentId]: false }));
    }
  };

  const handleDeleteHRManagerClick = (hrManager: DepartmentHRManager, departmentId: string) => {
    if (!canDeleteEmployee(user?.role || 'EMPLOYEE')) {
      toast.error('You do not have permission to delete HR managers');
      return;
    }
    setHrManagerToDelete({ hrManager, departmentId });
    setHrManagerDeleteDialogOpen(true);
  };

  const handleDeleteHRManagerConfirm = async () => {
    if (!hrManagerToDelete) return;

    const { hrManager, departmentId } = hrManagerToDelete;
    setDeletingHRManager(hrManager.id);
    try {
      await deleteDepartmentHRManager(hrManager.id);
      toast.success(`HR manager ${hrManager.employeeName} removed successfully`);
      
      // Reload HR managers for this department
      await loadHRManagersForDepartment(departmentId);
    } catch (error) {
      console.error('Error deleting HR manager:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete HR manager');
    } finally {
      setDeletingHRManager(null);
      setHrManagerDeleteDialogOpen(false);
      setHrManagerToDelete(null);
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;
    
    setDeleting(true);
    try {
      await deleteDepartment(departmentToDelete.id);
      setDepartments(departments.filter(d => d.id !== departmentToDelete.id));
      toast.success('Department deleted successfully');
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
          <p className="text-gray-600">Organize and manage company departments</p>
        </div>
        <div className="flex gap-2">
          {onAssignHRManagers && canEditEmployee(user?.role || 'EMPLOYEE') && (
            <Button onClick={onAssignHRManagers} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <UserPlus className="mr-2 h-4 w-4" />
              Assign HR Managers
            </Button>
          )}
          {canEditEmployee(user?.role || 'EMPLOYEE') && (
            <Button onClick={onDepartmentAdd} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building className="h-4 w-4" />
          <span>
            Showing {filteredDepartments.length} of {departments.length} departments
          </span>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
                <p className="text-gray-500 text-center">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first department'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredDepartments.map(department => (
            <Card key={department.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1" onClick={() => onDepartmentSelect(department)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{department.name}</h3>
                    </div>
                    {department.description && (
                      <p className="text-sm text-gray-600 mb-3">{department.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {department.employeeCount} employee{department.employeeCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {department.headId && (
                          <Badge variant="outline" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Has Head
                          </Badge>
                        )}
                      </div>
                      
                      {/* HR Managers Section */}
                      {loadingHRManagers[department.id] ? (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Loading HR managers...</span>
                        </div>
                      ) : hrManagers[department.id] !== undefined ? (
                        hrManagers[department.id].length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <UserPlus className="h-3 w-3" />
                              <span className="font-medium">HR Incharge:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {hrManagers[department.id].map((hr) => (
                                <Badge 
                                  key={hr.id} 
                                  variant="secondary" 
                                  className="text-xs flex items-center gap-1 pr-1"
                                  title={`${hr.employeeName} (${hr.employeeEmail})`}
                                >
                                  <Mail className="h-2.5 w-2.5" />
                                  <span>{hr.employeeName}</span>
                                  {canDeleteEmployee(user?.role || 'EMPLOYEE') && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteHRManagerClick(hr, department.id);
                                      }}
                                      disabled={deletingHRManager === hr.id}
                                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors disabled:opacity-50"
                                      title={`Remove ${hr.employeeName} as HR manager`}
                                    >
                                      {deletingHRManager === hr.id ? (
                                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                      ) : (
                                        <X className="h-2.5 w-2.5" />
                                      )}
                                    </button>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">
                            No HR manager assigned
                          </div>
                        )
                      ) : null}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDepartmentSelect(department)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canEditEmployee(user?.role || 'EMPLOYEE') && (
                        <DropdownMenuItem onClick={() => onDepartmentEdit(department)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDeleteEmployee(user?.role || 'EMPLOYEE') && (
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteClick(department)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Department Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{departmentToDelete?.name}"? 
              {departmentToDelete?.employeeCount && departmentToDelete.employeeCount > 0 && (
                <span className="text-red-600 font-medium">
                  {' '}This department has {departmentToDelete.employeeCount} employee(s) assigned to it.
                </span>
              )}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete HR Manager Confirmation Dialog */}
      <AlertDialog open={hrManagerDeleteDialogOpen} onOpenChange={setHrManagerDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove HR Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{hrManagerToDelete?.hrManager.employeeName}</strong> as HR manager from this department?
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setHrManagerDeleteDialogOpen(false);
              setHrManagerToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHRManagerConfirm}
              disabled={deletingHRManager !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingHRManager ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
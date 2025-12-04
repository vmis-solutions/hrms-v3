'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Mail,
  User as UserIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SystemUser } from '@/types';
import { getUsersPaginated } from '@/lib/users';
import { useAuth } from '@/contexts/AuthContext';

interface UserListProps {
  onUserSelect?: (user: SystemUser) => void;
  onUserEdit?: (user: SystemUser) => void;
  onUserAdd?: () => void;
}

export default function UserList({ 
  onUserSelect, 
  onUserEdit, 
  onUserAdd 
}: UserListProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false
  });

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const result = await getUsersPaginated({
          pageNumber,
          pageSize,
          search: appliedSearch || undefined
        });
        setUsers(result.items);
        setPaginationInfo({
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          hasPrevious: result.hasPrevious,
          hasNext: result.hasNext
        });
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [pageNumber, pageSize, appliedSearch]);

  const handleSearch = () => {
    setPageNumber(1);
    setAppliedSearch(searchTerm.trim());
  };

  const handlePreviousPage = () => {
    if (paginationInfo.hasPrevious) {
      setPageNumber(prev => Math.max(1, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (paginationInfo.hasNext) {
      setPageNumber(prev => prev + 1);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setPageNumber(1);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage system users and their accounts</p>
        </div>
        {onUserAdd && (
          <Button onClick={onUserAdd} className="bg-blue-600 hover:bg-blue-700">
            <UserIcon className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                onClick={handleSearch}
                className="ml-2 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>
            Showing {users.length} users · Page {pageNumber} of {paginationInfo.totalPages}
            {appliedSearch && ` · Search: "${appliedSearch}"`}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Total Users: {paginationInfo.totalCount}
        </div>
      </div>

      {/* User Cards */}
      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 text-center">
                {appliedSearch
                  ? 'Try adjusting your search criteria'
                  : 'No users available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map(userItem => (
            <Card key={userItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1" onClick={() => onUserSelect?.(userItem)}>
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {userItem.firstName[0]}{userItem.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {userItem.firstName} {userItem.middleName && `${userItem.middleName[0]}.`} {userItem.lastName}
                        </h3>
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          {userItem.userName}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{userItem.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <UserIcon className="h-3 w-3" />
                          <span>{userItem.employeeNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-gray-500">
                      <p className="font-medium">ID: {userItem.id.substring(0, 8)}...</p>
                      <p>Employee ID: {userItem.employeeId.substring(0, 8)}...</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onUserSelect && (
                          <DropdownMenuItem onClick={() => onUserSelect(userItem)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onUserEdit && (
                          <DropdownMenuItem onClick={() => onUserEdit(userItem)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-600">
            Page {pageNumber} of {paginationInfo.totalPages} · {paginationInfo.totalCount} users total
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreviousPage} disabled={!paginationInfo.hasPrevious || loading}>
              Previous
            </Button>
            <Button variant="outline" onClick={handleNextPage} disabled={!paginationInfo.hasNext || loading}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Eye,
  Building2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Company } from '@/types';
import { getCompanies } from '@/lib/companies';
import { useAuth } from '@/contexts/AuthContext';
import { canManageCompany } from '@/lib/auth';
import { toast } from 'sonner';

interface CompanyListProps {
  onCompanySelect: (company: Company) => void;
  onCompanyEdit: (company: Company) => void;
  onCompanyAdd: () => void;
}

export default function CompanyList({ 
  onCompanySelect, 
  onCompanyEdit, 
  onCompanyAdd 
}: CompanyListProps) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      const errorMessage = error?.message || 'Failed to load companies';
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (company.address && company.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (company.contactEmail && company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
          <p className="text-gray-600">View and manage company information</p>
        </div>
        {canManageCompany(user?.role || 'EMPLOYEE') && (
          <Button onClick={onCompanyAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
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
          <Building2 className="h-4 w-4" />
          <span>
            Showing {filteredCompanies.length} of {companies.length} companies
          </span>
        </div>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-500 text-center">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first company'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredCompanies.map(company => (
            <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1" onClick={() => onCompanySelect(company)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
                    </div>
                    {company.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.description}</p>
                    )}
                    <div className="space-y-2">
                      {company.address && (
                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{company.address}</span>
                        </div>
                      )}
                      {company.contactEmail && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{company.contactEmail}</span>
                        </div>
                      )}
                      {company.contactPhone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{company.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onCompanySelect(company)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canManageCompany(user?.role || 'EMPLOYEE') && (
                        <DropdownMenuItem onClick={() => onCompanyEdit(company)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
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
    </div>
  );
}


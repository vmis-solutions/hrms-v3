'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  User, 
  FileText,
  Shield,
  Heart,
  CreditCard,
  Receipt,
  Cake,
  Users,
  Upload
} from 'lucide-react';
import { Employee, EmploymentStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { canEditEmployee } from '@/lib/auth';
import { uploadEmployeeDocument, getEmployeeDocuments, deleteEmployeeDocument, EmployeeDocumentResponse } from '@/lib/employees';
import { getCurrentApiBaseUrl } from '@/lib/config';
import { toast } from 'sonner';

interface EmployeeProfileProps {
  employee: Employee;
  onBack: () => void;
  onEdit: (employee: Employee) => void;
}

export default function EmployeeProfile({ employee, onBack, onEdit }: EmployeeProfileProps) {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentName: '',
    documentType: '',
    documentDescription: '',
    document: null as File | null,
  });
  const [documents, setDocuments] = useState<EmployeeDocumentResponse[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const documentViewBaseUrl = `${getCurrentApiBaseUrl().replace(/\/$/, '')}/EmployeeDocs`;

  const loadEmployeeDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const result = await getEmployeeDocuments(employee.id);
      setDocuments(result);
      setDocumentsError(null);
    } catch (error: any) {
      console.error('Error fetching employee documents:', error);
      setDocumentsError(error.message || 'Failed to load documents');
    } finally {
      setDocumentsLoading(false);
    }
  }, [employee.id]);

  useEffect(() => {
    loadEmployeeDocuments();
  }, [loadEmployeeDocuments]);

  const buildDocumentUrl = (filePath?: string | null) => {
    if (!filePath) return null;
    let cleaned = filePath.trim().replace(/\\/g, '/');
    if (!cleaned) return null;
    if (!cleaned.startsWith('/')) {
      cleaned = `/${cleaned}`;
    }
    return encodeURI(`${documentViewBaseUrl}${cleaned}`);
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = window.confirm('Delete this document? This action cannot be undone.');
    if (!confirmed) return;
    setDeletingDocId(documentId);
    try {
      await deleteEmployeeDocument(documentId);
      toast.success('Document deleted successfully');
      await loadEmployeeDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Failed to delete document');
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file only');
        return;
      }
      setUploadForm(prev => ({ ...prev, document: file }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.document) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    if (!uploadForm.documentName.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    if (!uploadForm.documentType.trim()) {
      toast.error('Please enter a document type');
      return;
    }

    setUploading(true);
    try {
      await uploadEmployeeDocument({
        documentName: uploadForm.documentName,
        documentType: uploadForm.documentType,
        documentDescription: uploadForm.documentDescription,
        document: uploadForm.document,
        employeeId: employee.id,
      });
      
      toast.success('Document uploaded successfully');
      setUploadDialogOpen(false);
      setUploadForm({
        documentName: '',
        documentType: '',
        documentDescription: '',
        document: null,
      });
      await loadEmployeeDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    const variants: { [key: string]: { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string } } = {
      Regular: { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      Probationary: { variant: 'outline', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      Contractual: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      ProjectBased: { variant: 'secondary', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
      Resigned: { variant: 'destructive', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      Terminated: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' }
    };

    const config = variants[status] || variants.Regular;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
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

  return (
    <div className="space-y-6">
      {/* Upload Document Dialog - Single instance for all buttons */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Employee Document</DialogTitle>
            <DialogDescription>
              Upload a PDF document for this employee. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name *</Label>
                <Input
                  id="documentName"
                  placeholder="e.g., Employment Contract"
                  value={uploadForm.documentName}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Input
                  id="documentType"
                  placeholder="e.g., Contract, Certificate, ID"
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentType: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentDescription">Description</Label>
                <Textarea
                  id="documentDescription"
                  placeholder="Optional description of the document"
                  value={uploadForm.documentDescription}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentDescription: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">PDF File *</Label>
                <Input
                  id="document"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
                {uploadForm.document && (
                  <p className="text-sm text-gray-600">
                    Selected: {uploadForm.document.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Profile</h2>
            <p className="text-gray-600">Complete employee information and records</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
          {canEditEmployee(user?.role || 'EMPLOYEE') && (
            <Button onClick={() => onEdit(employee)} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal & Employment Information</span>
              </CardTitle>
              
            </div>
          </CardHeader>
            <CardContent className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {employee.firstName[0]}{employee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {employee.firstName} {employee.middleName && `${employee.middleName} `}{employee.lastName}
                  </h3>
                  {getStatusBadge(employee.employmentStatus)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">{employee.jobTitle || ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{employee.department || ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
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

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Personal Details</span>
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Cake className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Birth Date:</span>
                    <span className="text-gray-900">{formatDate(employee.birthDate)} ({calculateAge(employee.birthDate)} years old)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Gender:</span>
                    <span className="text-gray-900">{employee.gender}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Civil Status:</span>
                    <span className="text-gray-900">{employee.civilStatus}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Contact Information</span>
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                      {employee.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <a href={`tel:${employee.phoneNumber}`} className="text-blue-600 hover:underline">
                      {employee.phoneNumber}
                    </a>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">Address:</span>
                    <span className="text-gray-900">{employee.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Employment Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Employment Details</span>
                </h4>
                
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">Date Hired:</span>
                  <span className="text-gray-900">{formatDate(employee.dateHired)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">Employment Status:</span>
                  <span className="text-gray-900">{employee.employmentStatus}</span>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Employee Documents</span>
              </CardTitle>
              <p className="text-sm text-gray-500">
                Quick list of uploaded PDF files. Click view to open the document.
              </p>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-10 rounded-md bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : documentsError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {documentsError}
                </div>
              ) : documents.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  No documents uploaded yet.
                </div>
              ) : (
                <div className="divide-y">
                  {documents.map((doc) => {
                    const fileUrl = buildDocumentUrl(doc.filePath);
                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {doc.documentName || 'Untitled document'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.filePath || 'No file path'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded {formatDate(doc.uploadedDate)}
                          </p>
                          {doc.documentDescription && (
                            <p className="text-xs text-gray-500">{doc.documentDescription}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {fileUrl ? (
                            <Button variant="link" size="sm" className="px-0" asChild>
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                View PDF
                              </a>
                            </Button>
                          ) : (
                          <span className="text-xs text-gray-400">No file path</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 px-0"
                            disabled={deletingDocId === doc.id}
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            {deletingDocId === doc.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Government IDs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Government IDs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 text-sm">
                {employee.sssNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SSS:</span>
                    <span className="font-medium">{employee.sssNumber}</span>
                  </div>
                )}
                {employee.philHealthNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">PhilHealth:</span>
                    <span className="font-medium">{employee.philHealthNumber}</span>
                  </div>
                )}
                {employee.pagIbigNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pag-IBIG:</span>
                    <span className="font-medium">{employee.pagIbigNumber}</span>
                  </div>
                )}
                {employee.tin && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">TIN:</span>
                    <span className="font-medium">{employee.tin}</span>
                  </div>
                )}
              </div>
              {!employee.sssNumber && !employee.philHealthNumber && 
               !employee.pagIbigNumber && !employee.tin && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No government IDs on file
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Record Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Created:</span>
                  <span className="text-gray-900">{formatDate(employee.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-900">{formatDate(employee.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date Hired:</span>
                  <span className="text-gray-900">{formatDate(employee.dateHired)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
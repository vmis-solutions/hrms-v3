'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Briefcase,
  Loader2
} from 'lucide-react';
import { JobTitle, Department } from '@/types';
import { createJobTitle, updateJobTitle } from '@/lib/jobTitles';
import { getDepartments } from '@/lib/departments';
import { toast } from 'sonner';

interface JobTitleFormProps {
  jobTitle?: JobTitle;
  onBack: () => void;
  onSave: (jobTitle: JobTitle) => void;
}

export default function JobTitleForm({ jobTitle, onBack, onSave }: JobTitleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (jobTitle) {
      setFormData({
        title: jobTitle.title,
        description: jobTitle.description || '',
        departmentId: jobTitle.departmentId || ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        departmentId: ''
      }));
    }
  }, [jobTitle]);

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const data = await getDepartments();
      setDepartments(data);

      if (!jobTitle) {
        // If creating new, pre-select first department for convenience
        setFormData(prev => ({
          ...prev,
          departmentId: prev.departmentId || data[0]?.id || ''
        }));
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let savedJobTitle: JobTitle;
      
      if (jobTitle) {
        // Update existing job title
        savedJobTitle = await updateJobTitle(jobTitle.id, {
          ...formData,
          description: formData.description || undefined,
          departmentId: formData.departmentId
        });
        toast.success('Job title updated successfully');
      } else {
        // Create new job title
        savedJobTitle = await createJobTitle({
          ...formData,
          description: formData.description || undefined,
          departmentId: formData.departmentId
        });
        toast.success('Job title created successfully');
      }
      
      onSave(savedJobTitle);
    } catch (error) {
      console.error('Error saving job title:', error);
      toast.error('Failed to save job title');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {jobTitle ? 'Edit Job Title' : 'Add New Job Title'}
          </h2>
          <p className="text-gray-600">
            {jobTitle ? 'Update job title information' : 'Create a new job position for your organization'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Job Title Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleInputChange('departmentId', value)}
                  disabled={departmentsLoading}
                >
                  <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={departmentsLoading ? 'Loading departments...' : 'Select department'} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(department => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-red-600">{errors.departmentId}</p>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the job role and responsibilities"
                  rows={4}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {jobTitle ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {jobTitle ? 'Update Job Title' : 'Create Job Title'}
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
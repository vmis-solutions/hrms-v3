'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck, FileText, Calendar, Clock, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentActivities, RecentActivity as RecentActivityType, ActivityType } from '@/lib/dashboard';
import { toast } from 'sonner';

export default function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const activitiesData = await getRecentActivities(10, user?.companyId);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading recent activities:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'hire':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'status_change':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'leave':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case 'promotion':
        return <Award className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) return null;
    
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      Regular: 'default',
      Probationary: 'outline',
      Contractual: 'secondary',
      ProjectBased: 'secondary',
      Resigned: 'destructive',
      Terminated: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'default'} className="text-xs">
        {status}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4 p-3 rounded-lg">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={activity.employeeAvatar || undefined} alt={activity.employeeName} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                {activity.employeeName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 truncate">
                  {activity.employeeName}
                </p>
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {activity.employeePosition}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-gray-800">{activity.action}</p>
                {getStatusBadge(activity.status)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
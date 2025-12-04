'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserCheck, AlertTriangle, Clock, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, DashboardStatsResponse } from '@/lib/dashboard';
import { toast } from 'sonner';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

function StatsCard({ title, value, icon, trend, trendUp, color }: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '↗' : '↘'} {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await getDashboardStats(user?.companyId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      icon: <Users className="h-5 w-5 text-blue-600" />,
      trend: stats.totalEmployeesTrend?.description,
      trendUp: stats.totalEmployeesTrend?.isIncrease,
      color: 'bg-blue-100'
    },
    {
      title: 'Regular Employees',
      value: stats.regularEmployees.toString(),
      icon: <UserCheck className="h-5 w-5 text-green-600" />,
      trend: stats.regularEmployeesTrend?.description,
      trendUp: stats.regularEmployeesTrend?.isIncrease,
      color: 'bg-green-100'
    },
    {
      title: 'Probationary',
      value: stats.probationaryEmployees.toString(),
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      trend: stats.probationaryEmployeesTrend?.description,
      trendUp: stats.probationaryEmployeesTrend?.isIncrease,
      color: 'bg-yellow-100'
    },
    {
      title: 'Contractual',
      value: stats.contractualEmployees.toString(),
      icon: <Award className="h-5 w-5 text-purple-600" />,
      trend: stats.contractualEmployeesTrend?.description,
      trendUp: stats.contractualEmployeesTrend?.isIncrease,
      color: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
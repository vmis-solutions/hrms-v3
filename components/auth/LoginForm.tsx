  'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  const demoAccounts = [
    { email: 'hr.manager@company.com', role: 'HR Manager', description: 'Full system access across all companies' },
    { email: 'hr.supervisor@company.com', role: 'HR Supervisor', description: 'Company-wide HR operations' },
    { email: 'hr.company@company.com', role: 'HR Company Level', description: 'Company-specific HR operations' },
    { email: 'dept.head@company.com', role: 'Department Head', description: 'Department employee management' },
    { email: 'employee@company.com', role: 'Employee', description: 'Limited employee access' }
  ];

  const loginWithDemo = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HRMS Philippines</h1>
          <p className="text-gray-600">Employee Management System</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowDemo(!showDemo)}
                className="text-sm"
              >
                <Users className="mr-2 h-4 w-4" />
                {showDemo ? 'Hide' : 'Show'} Demo Accounts
              </Button>
            </div>

            {showDemo && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Demo Accounts (Password: password123)</p>
                {demoAccounts.map((account, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => loginWithDemo(account.email)}
                  >
                    <div>
                      <p className="font-medium text-sm">{account.role}</p>
                      <p className="text-xs text-gray-500">{account.description}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 HRMS Philippines. All rights reserved.</p>
          <p className="mt-1">Built for Philippine companies and employees</p>
        </div>
      </div>
    </div>
  );
}
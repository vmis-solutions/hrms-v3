  'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentApiBaseUrl } from '@/lib/config';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const { login, isLoading } = useAuth();

  // Get current API URL on mount
  useEffect(() => {
    const currentUrl = getCurrentApiBaseUrl();
    setApiUrl(currentUrl);
  }, []);

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

  const handleApiUrlSave = () => {
    if (apiUrl.trim()) {
      localStorage.setItem('api_base_url', apiUrl.trim());
      setError('');
      // Force page reload to apply new API URL
      window.location.reload();
    }
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

            {/* API Configuration Section */}
            <div className="border-t pt-4 mt-4">
              <button
                type="button"
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>API Configuration</span>
                </div>
                {showApiConfig ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {showApiConfig && (
                <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="api-url" className="text-xs">API Base URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="api-url"
                        type="text"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="http://your-api-server:9001"
                        className="h-9 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleApiUrlSave}
                        size="sm"
                        className="h-9"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Current: {getCurrentApiBaseUrl()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Update the API URL if you're having connection issues. The page will reload after saving.
                    </p>
                  </div>
                </div>
              )}
            </div>
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
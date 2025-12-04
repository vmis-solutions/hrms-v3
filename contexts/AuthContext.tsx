'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '@/types';
import { authenticate } from '@/lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hrms_token');
};

// Global logout function that can be called from anywhere
let globalLogout: (() => void) | null = null;

export const handleTokenExpiration = () => {
  if (globalLogout) {
    globalLogout();
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user and token are stored in localStorage
    try {
      const storedUser = localStorage.getItem('hrms_user');
      const storedToken = localStorage.getItem('hrms_token');
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        // Clear if incomplete
        localStorage.removeItem('hrms_user');
        localStorage.removeItem('hrms_token');
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('hrms_user');
      localStorage.removeItem('hrms_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Use username for the API
      const result = await authenticate(username, password);
      if (result) {
        setUser(result.user);
        localStorage.setItem('hrms_user', JSON.stringify(result.user));
        localStorage.setItem('hrms_token', result.token);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      // Re-throw to allow LoginForm to show error message
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_token');
    // Force a re-render to show login form
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  // Set global logout function so it can be called from API utilities
  useEffect(() => {
    globalLogout = logout;
    return () => {
      globalLogout = null;
    };
  }, [logout]);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
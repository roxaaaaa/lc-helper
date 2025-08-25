'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JWTService } from '../lib/jwt';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  year: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isLoading: boolean;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    if (!token) return false;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        // Token refresh failed, logout user
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check token validity and refresh if needed
  const checkAndRefreshToken = async (storedToken: string, storedUser: string) => {
    try {
      // Check if token is expired or close to expiring
      if (JWTService.isTokenExpired(storedToken) || JWTService.shouldRefreshToken(storedToken)) {
        // Try to refresh the token
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          // If refresh fails, clear stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
      } else {
        // Token is still valid, set it
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    // Check for existing token and user data on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      checkAndRefreshToken(storedToken, storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    refreshToken,
    isLoading,
    isRefreshing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
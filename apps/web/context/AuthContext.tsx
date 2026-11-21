'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setStoredToken, getStoredToken } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  role: 'ADMIN' | 'INSTITUTION' | 'STUDENT' | 'VERIFIER';
  firstName: string;
  lastName: string;
  institution?: {
    id: string;
    legalName: string;
    shortCode: string;
    status: string;
  };
  student?: {
    id: string;
    enrollmentNumber: string;
    department: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  role: 'ADMIN' | 'INSTITUTION' | 'STUDENT' | 'VERIFIER' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const data = await api.auth.me();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setStoredToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const result = await api.auth.login(email, password);
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const result = await api.auth.register(payload);
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

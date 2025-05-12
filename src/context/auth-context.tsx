
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<boolean>; // Make password optional for flexibility if needed later
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'jrk-auth-status';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as loading
  const router = useRouter();
  const pathname = usePathname();

  // Check localStorage on initial load
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedAuthStatus = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuthStatus === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Redirect if not authenticated and not already on login page
        if (pathname !== '/login') {
           router.replace('/login');
        }
      }
    } catch (error) {
        console.error("Error reading auth status from localStorage:", error);
        setIsAuthenticated(false); // Default to not authenticated on error
         if (pathname !== '/login') {
           router.replace('/login');
        }
    } finally {
         setIsLoading(false); // Finish loading after check
    }
  }, [pathname, router]); // Depend on pathname and router

  const login = useCallback(async (username: string, password?: string): Promise<boolean> => {
     // Basic hardcoded check for demo purposes
     // In a real app, this would involve an API call and proper password verification.
    if (username === 'Admin' && password === '123456789') {
        setIsAuthenticated(true);
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        } catch (error) {
             console.error("Error saving auth status to localStorage:", error);
        }
        // Don't redirect here, let the component calling login handle redirection
        return true;
    } else {
        setIsAuthenticated(false);
         try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
             console.error("Error removing auth status from localStorage:", error);
        }
        return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // No dependencies needed for this simple version

  const logout = useCallback(() => {
    setIsAuthenticated(false);
     try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
         console.error("Error removing auth status from localStorage on logout:", error);
    }
    router.replace('/login'); // Redirect to login on logout
  }, [router]);


  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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



"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Supervisor } from '@/lib/types'; // Import Supervisor type
import { AUTH_STORAGE_KEY, CURRENT_USER_STORAGE_KEY, SUPERVISORS_STORAGE_KEY } from '@/lib/storageKeys'; // Import new keys

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUsername: string | null; // Track the logged-in username
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  registerSupervisor: (supervisorData: Omit<Supervisor, 'id'>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define initial empty array for supervisors
const initialSupervisors: Supervisor[] = [];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors); // State for supervisors
  const router = useRouter();
  const pathname = usePathname();

  // Load auth status, current user, and supervisors on initial load
  useEffect(() => {
    setIsLoading(true);
    let authenticated = false;
    let username: string | null = null;

    try {
      const storedAuthStatus = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedUsername = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

      if (storedAuthStatus === 'true' && storedUsername) {
        authenticated = true;
        username = storedUsername;
      }

      // Load supervisors
      const storedSupervisors = localStorage.getItem(SUPERVISORS_STORAGE_KEY);
      if (storedSupervisors) {
        setSupervisors(JSON.parse(storedSupervisors));
      } else {
        // Initialize if not present
        localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(initialSupervisors));
        setSupervisors(initialSupervisors);
      }

    } catch (error) {
      console.error("Error reading auth/supervisor data from localStorage:", error);
      authenticated = false;
      username = null;
      // Attempt to clear potentially corrupted storage
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(initialSupervisors)); // Reset supervisors on error
      } catch (clearError) {
        console.error("Error clearing localStorage:", clearError);
      }
    } finally {
      setIsAuthenticated(authenticated);
      setCurrentUsername(username);
      if (!authenticated && pathname !== '/login') {
        router.replace('/login');
      }
      setIsLoading(false);
    }
  }, [pathname, router]);

  const login = useCallback(async (username: string, password?: string): Promise<boolean> => {
    let loggedIn = false;

    // 1. Check hardcoded Admin user
    if (username === 'Admin' && password === '123456789') {
      loggedIn = true;
    } else {
      // 2. Check supervisors list
      const supervisor = supervisors.find(s => s.username === username && s.password === password);
      // WARNING: Direct password comparison is insecure. Use hashing in production.
      if (supervisor) {
        loggedIn = true;
      }
    }

    if (loggedIn) {
      setIsAuthenticated(true);
      setCurrentUsername(username);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, username);
      } catch (error) {
        console.error("Error saving auth status to localStorage:", error);
        // Should ideally handle this more gracefully, maybe notify user
      }
      return true;
    } else {
      setIsAuthenticated(false);
      setCurrentUsername(null);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      } catch (error) {
        console.error("Error removing auth status from localStorage:", error);
      }
      return false;
    }
  }, [supervisors]); // Depend on supervisors state

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUsername(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing auth status from localStorage on logout:", error);
    }
    router.replace('/login');
  }, [router]);

  const registerSupervisor = useCallback(async (supervisorData: Omit<Supervisor, 'id'>): Promise<{ success: boolean; error?: string }> => {
    // Only allow Admin to register supervisors
    if (currentUsername !== 'Admin') {
      return { success: false, error: "Unauthorized" };
    }

    // Check if username already exists (case-insensitive check)
    const usernameExists = supervisors.some(
      s => s.username.toLowerCase() === supervisorData.username.toLowerCase()
    );
    if (usernameExists) {
      return { success: false, error: "Username already exists." };
    }

    const newSupervisor: Supervisor = {
      id: crypto.randomUUID(),
      ...supervisorData,
    };

    const updatedSupervisors = [...supervisors, newSupervisor];

    try {
      localStorage.setItem(SUPERVISORS_STORAGE_KEY, JSON.stringify(updatedSupervisors));
      setSupervisors(updatedSupervisors); // Update state
      return { success: true };
    } catch (error) {
      console.error("Error saving new supervisor to localStorage:", error);
      return { success: false, error: "Failed to save supervisor data." };
    }
  }, [supervisors, currentUsername]); // Depend on supervisors and currentUsername


  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, currentUsername, login, logout, registerSupervisor }}>
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

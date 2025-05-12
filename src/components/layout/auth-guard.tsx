
"use client";

import React, { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react'; // For loading indicator

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if loading, already on login, or authenticated
    if (isLoading || pathname === '/login' || isAuthenticated) {
      return;
    }

    // If not loading, not authenticated, and not on login, redirect
    router.replace('/login');

  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated or on the login page, render children
  if (isAuthenticated || pathname === '/login') {
    return <>{children}</>;
  }

  // Otherwise, render nothing (or a minimal loading state) while redirecting
  // This prevents flashing the protected content briefly
  return (
     <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
  );
}

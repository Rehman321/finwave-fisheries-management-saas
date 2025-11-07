'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './authContext';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = ['/login'];

export function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip redirect during initial loading
    if (isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to login if not authenticated and not on a public route
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      // Redirect to dashboard if already authenticated and trying to access login
      router.push('/');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show nothing during the initial loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated and not on a public route, don't render children
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
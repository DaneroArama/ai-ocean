"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Component that guards routes requiring authentication
 * Redirects to sign-in page if user is not authenticated
 * 
 * @param children - The protected content
 * @param redirectTo - Where to redirect if not authenticated (default: "/auth/signin")
 * @param requireAuth - Whether authentication is required (default: true)
 */
export function AuthGuard({ 
  children, 
  redirectTo = "/auth/signin",
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not authenticated, show nothing
  // (redirect will happen via useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

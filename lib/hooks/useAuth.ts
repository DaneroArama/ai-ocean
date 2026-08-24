"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Hook to access authentication state and user information
 * 
 * NOTE: Currently returns mock data because ConvexAuthProvider is disabled.
 * Once OAuth credentials are configured, re-enable ConvexAuthNextjsProvider
 * in lib/convex/ConvexClientProvider.tsx and uncomment the useConvexAuth import.
 * 
 * @returns {Object} Authentication state
 * @property {boolean} isAuthenticated - Whether the user is authenticated
 * @property {boolean} isLoading - Whether authentication is being checked
 * @property {Object|null} user - Current user identity (null if not authenticated)
 * @property {Object|null} session - Current session information
 */
export function useAuth() {
  // TODO: Re-enable when ConvexAuthNextjsProvider is active
  // import { useConvexAuth } from "@convex-dev/auth/react";
  // const { isAuthenticated, isLoading } = useConvexAuth();
  
  // Temporary fallback for development without auth
  const isAuthenticated = false;
  const isLoading = false;
  
  // Type-safe way to check if auth queries are available
  const authApi = (api as any).auth;
  
  const user = useQuery(
    authApi?.getCurrentUser ?? ("skip" as any),
    isAuthenticated ? {} : "skip"
  );
  
  const session = useQuery(
    authApi?.getSession ?? ("skip" as any),
    isAuthenticated ? {} : "skip"
  );

  return {
    isAuthenticated,
    isLoading,
    user,
    session,
  };
}

/**
 * Hook to check if user is authenticated
 * Simpler version that only returns auth status
 */
export function useIsAuthenticated() {
  // TODO: Re-enable when ConvexAuthNextjsProvider is active
  // import { useConvexAuth } from "@convex-dev/auth/react";
  // const { isAuthenticated, isLoading } = useConvexAuth();
  
  // Temporary fallback for development without auth
  return { isAuthenticated: false, isLoading: false };
}

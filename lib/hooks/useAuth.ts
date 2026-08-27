"use client";

import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Hook to access authentication state + Convex participant profile
 * Now live against Convex DB — uses ConvexAuthNextjsProvider
 */
export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const participant = useQuery(
    api.participants.getCurrentParticipant,
    isAuthenticated ? {} : "skip"
  );

  // participant doc contains role, email, name, image, preferredLanguage
  return {
    isAuthenticated,
    isLoading: isLoading || (isAuthenticated && participant === undefined),
    user: participant ?? null,
    participant,
    session: null as unknown,
  };
}

export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return { isAuthenticated, isLoading };
}

/** Convenience: is current participant admin? */
export function useIsAdmin() {
  const { isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(api.participants.isAdmin, isAuthenticated ? {} : "skip");
  return { isAdmin: !!isAdmin, isLoading: isAdmin === undefined };
}

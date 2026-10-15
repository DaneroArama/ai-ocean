"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, participant } = useAuth();
  const { isAuthenticated: convexAuth } = useConvexAuth();
  const { signOut } = useAuthActions();
  const ensure = useMutation(api.participants.ensureCurrentParticipant);
  const router = useRouter();
  const pathname = usePathname();
  const rejected = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/auth/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Sessions whose email is not on the roster are signed out immediately.
  useEffect(() => {
    if (!convexAuth || participant !== null || rejected.current) return;
    rejected.current = true;
    ensure({}).catch(async () => {
      await signOut();
      router.replace(`/auth/signin?reason=not-invited`);
    });
  }, [convexAuth, participant, ensure, signOut, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !participant) return null;

  return <>{children}</>;
}

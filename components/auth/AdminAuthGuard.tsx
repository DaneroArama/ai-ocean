"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

type Participant = Doc<"participants">;

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();

  const participant = useQuery(
    api.participants.getCurrentParticipant,
    isAuthenticated ? {} : "skip"
  ) as Participant | null | undefined;
  const isAdmin = useQuery(api.participants.isAdmin, isAuthenticated ? {} : "skip");
  const ensure = useMutation(api.participants.ensureCurrentParticipant);

  useEffect(() => {
    if (isAuthenticated && participant === null) {
      ensure({}).catch(() => {});
    }
  }, [isAuthenticated, participant, ensure]);

  const loading = authLoading || (isAuthenticated && (participant === undefined || isAdmin === undefined));

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/auth/signin?next=/admin");
      return;
    }
    if (participant === null) return;
    if (isAdmin === false) {
      router.replace("/?error=admin_required");
    }
  }, [loading, isAuthenticated, participant, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (participant === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-primary border-t-transparent" />
        <p className="text-sm text-gray-500">Creating your profile…</p>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="font-syncopate text-2xl font-bold text-red-600">Access denied</h1>
        <p className="mt-2 text-gray-600">Admin role required. Current role: {participant?.role}</p>
        <p className="mt-3 text-xs text-gray-400">
          First user is auto-admin. Otherwise open Convex dashboard → Data → participants → {participant?.email ?? ""} → role = admin
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Initialize Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // TODO: Re-enable ConvexAuthNextjsProvider once OAuth credentials are configured
  // For now, using plain ConvexProvider to allow development without authentication
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}

// When OAuth credentials are configured in Convex dashboard, replace with:
// import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
// return (
//   <ConvexAuthNextjsProvider client={convex}>
//     {children}
//   </ConvexAuthNextjsProvider>
// );

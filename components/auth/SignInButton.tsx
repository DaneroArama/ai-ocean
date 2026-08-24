"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useAuth } from "@/lib/hooks/useAuth";

interface SignInButtonProps {
  provider: "google" | "github";
  className?: string;
}

/**
 * Button component for OAuth sign-in
 * Supports Google and GitHub providers
 */
export function SignInButton({ provider, className = "" }: SignInButtonProps) {
  const { signIn } = useAuthActions();
  const { isLoading } = useAuth();

  const handleSignIn = () => {
    void signIn(provider);
  };

  const providerLabels = {
    google: "Sign in with Google",
    github: "Sign in with GitHub",
  };

  const providerIcons = {
    google: "🔵", // Google icon placeholder
    github: "⚫", // GitHub icon placeholder
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isLoading
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-white border border-gray-300 hover:bg-gray-50"
      } ${className}`}
    >
      <span>{providerIcons[provider]}</span>
      <span>{providerLabels[provider]}</span>
    </button>
  );
}

/**
 * Button component for sign out
 */
export function SignOutButton({ className = "" }: { className?: string }) {
  const { signOut } = useAuthActions();
  const { isLoading } = useAuth();

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isLoading
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-red-600 text-white hover:bg-red-700"
      } ${className}`}
    >
      Sign Out
    </button>
  );
}

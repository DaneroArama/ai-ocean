"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/register/main");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Redirecting to registration...</p>
    </div>
  );
}

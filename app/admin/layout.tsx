import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#f6fbfc]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-syncopate text-sm font-bold tracking-wide text-ocean-deep">
              AI-OCEAN ADMIN
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <Link href="/admin" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-100">
                Overview
              </Link>
              <Link href="/admin/roles" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
                Roles
              </Link>
              <Link href="/admin/questions" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
                Questions
              </Link>
              <Link href="/admin/registrations" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
                Registrations
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-700">
            ← Back to site
          </Link>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}

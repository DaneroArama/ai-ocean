import Link from "next/link";
import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#f6fbfc]">
        <AdminHeader />
        <nav className="flex gap-3 overflow-x-auto border-b bg-white px-4 py-3 text-xs md:hidden" aria-label="Admin sections">
          <Link href="/admin">Overview</Link><Link href="/admin/attendance" className="font-bold text-ocean-primary">Attendance</Link><Link href="/admin/teams">Teams</Link><Link href="/admin/judges">Judges Portal</Link><Link href="/admin/registrations">Registrations</Link><Link href="/admin/questions">Questions</Link>
        </nav>
        <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="flex flex-col gap-2">
          <Link
            href="/dashboard/admin"
            className={pathname === "/dashboard/admin" ? "font-bold text-blue-300" : ""}
          >
            Admin
          </Link>
          <Link
            href="/dashboard/user"
            className={pathname === "/dashboard/user" ? "font-bold text-blue-300" : ""}
          >
            User
          </Link>
          <Link
            href="/dashboard/reviewer"
            className={pathname === "/dashboard/reviewer" ? "font-bold text-blue-300" : ""}
          >
            Reviewer
          </Link>
          <Link
            href="/dashboard/organizer"
            className={pathname === "/dashboard/organizer" ? "font-bold text-blue-300" : ""}
          >
            Organizer
          </Link>
          <Link
            href="/dashboard/guest"
            className={pathname === "/dashboard/guest" ? "font-bold text-blue-300" : ""}
          >
            Guest
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { adminLogout } from "@/lib/api/admin";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/admin", label: "Pesanan", icon: "📋", exact: true },
  { href: "/admin/scan", label: "Scan QR", icon: "📷", exact: false },
  { href: "/admin/products", label: "Produk", icon: "🍱", exact: false },
  { href: "/admin/customers", label: "Customers", icon: "👥", exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, admin, token, clearAuth } = useAdminAuth();

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, pathname, router]);

  async function handleLogout() {
    if (token) {
      try {
        await adminLogout(token);
      } catch {
        // ignore — still clear local state
      }
    }
    clearAuth();
    router.replace("/admin/login");
    toast.success("Berhasil logout");
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-neutral-200 fixed h-full">
        <div className="px-5 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-sm font-black">
              H
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">HATAKU</p>
              <p className="text-xs text-neutral-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-red-50 text-red-600"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-neutral-100">
          <div className="mb-3">
            <p className="text-sm font-medium text-neutral-800 truncate">{admin?.name}</p>
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                admin?.role === "admin"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {admin?.role === "admin" ? "Admin" : "Kasir"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-neutral-500 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-black">
              H
            </div>
            <span className="font-bold text-sm text-neutral-900">HATAKU Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                admin?.role === "admin"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {admin?.role === "admin" ? "Admin" : "Kasir"}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-neutral-500 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex z-10">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
                  active ? "text-red-600" : "text-neutral-400"
                }`}
              >
                <span className="text-lg mb-0.5">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

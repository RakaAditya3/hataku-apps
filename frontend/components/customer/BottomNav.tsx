"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, ClipboardList, User } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/menu", icon: Utensils, label: "Menu" },
  { href: "/orders", icon: ClipboardList, label: "Pesanan" },
  { href: "/profile", icon: User, label: "Akun" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg">
      <div className="flex justify-around max-w-md mx-auto px-2 pb-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center pt-2 pb-1 px-4 min-w-[60px] transition-colors ${
                isActive ? "text-[#C4956A]" : "text-subtext"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full mb-1 ${
                  isActive ? "bg-[#C4956A]" : "bg-transparent"
                }`}
              />
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.5}
                aria-hidden="true"
              />
              <span className="text-[10px] mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

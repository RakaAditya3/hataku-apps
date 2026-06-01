"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";

export function CartIcon() {
  const totalItems = useCartStore((s) => s.totalItems);

  return (
    <Link href="/cart" className="relative inline-flex items-center justify-center w-9 h-9">
      <span className="text-xl">🛒</span>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}

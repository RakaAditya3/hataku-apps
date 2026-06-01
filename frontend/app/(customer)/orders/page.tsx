"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getOrders } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/api";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:     "Menunggu Scan",
  paid:        "Sedang Diproses",
  in_progress: "Sedang Dibuat",
  done:        "Selesai",
  cancelled:   "Dibatalkan",
  expired:     "Kedaluwarsa",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid:        "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-orange-100 text-orange-800 border-orange-200",
  done:        "bg-green-100 text-green-800 border-green-200",
  cancelled:   "bg-red-100 text-red-800 border-red-200",
  expired:     "bg-gray-100 text-gray-600 border-gray-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (sessionStatus !== "authenticated" || !session?.user.sanctumToken) return;

    getOrders(session.user.sanctumToken)
      .then((res) => { if (res.success) setOrders(res.data); })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat pesanan"))
      .finally(() => setLoading(false));
  }, [sessionStatus, session?.user.sanctumToken, router]);

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="text-muted-foreground hover:text-foreground text-sm font-medium">
          ← Beranda
        </button>
        <h1 className="text-base font-bold flex-1">Pesanan Saya</h1>
      </header>

      <div className="px-4 py-4">
        {loading && (
          <p className="text-sm text-muted-foreground text-center py-12">Memuat...</p>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="text-5xl">📋</span>
            <div className="space-y-1">
              <p className="font-bold text-base">Belum ada pesanan</p>
              <p className="text-sm text-muted-foreground">Yuk pesan sekarang!</p>
            </div>
            <Link href="/menu" className="text-sm text-orange-600 font-semibold hover:underline">
              Lihat Menu
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.order_code}`}>
                <div className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono font-bold text-sm">{order.order_code}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                    <Badge className={`text-xs border flex-shrink-0 ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {order.items.length} item · {order.order_type === "dine_in" ? "Dine In" : "Takeaway"}
                    </span>
                    <span className="font-bold text-orange-600">{formatRupiah(order.total)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-2 flex justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">🥟</span>
          <span className="text-[10px] font-medium">Menu</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-0.5 text-orange-600">
          <span className="text-xl">📋</span>
          <span className="text-[10px] font-medium">Pesanan</span>
        </Link>
        <Link href="/rewards" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">🎁</span>
          <span className="text-[10px] font-medium">Reward</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>
    </main>
  );
}

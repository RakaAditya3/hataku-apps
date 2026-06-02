"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getOrders } from "@/lib/api/orders";
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

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:     "bg-amber-100 text-amber-700",
  paid:        "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  done:        "bg-green-100 text-green-700",
  cancelled:   "bg-gray-100 text-gray-500",
  expired:     "bg-gray-100 text-gray-500",
};

const STATUS_BORDER: Record<OrderStatus, string> = {
  pending:     "border-l-amber-400",
  paid:        "border-l-blue-400",
  in_progress: "border-l-blue-400",
  done:        "border-l-green-400",
  cancelled:   "border-l-gray-300",
  expired:     "border-l-gray-300",
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
    if (sessionStatus === "unauthenticated") { router.push("/login"); return; }
    if (sessionStatus !== "authenticated" || !session?.user.sanctumToken) return;

    getOrders(session.user.sanctumToken)
      .then((res) => { if (res.success) setOrders(res.data); })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat pesanan"))
      .finally(() => setLoading(false));
  }, [sessionStatus, session?.user.sanctumToken, router]);

  return (
    <main className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream px-4 py-3 flex items-center">
        <button
          onClick={() => router.push("/")}
          className="text-subtext hover:text-body-text text-xl leading-none w-8"
        >
          ←
        </button>
        <h1 className="flex-1 text-center font-bold text-base text-body-text">Pesanan Saya</h1>
        <div className="w-8" />
      </header>

      <div className="mt-2">
        {loading && (
          <p className="text-sm text-subtext text-center py-16">Memuat...</p>
        )}

        {error && (
          <div className="mx-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-8">
            <span className="text-5xl">📋</span>
            <div className="space-y-1">
              <p className="font-semibold text-base text-primary-dark">Belum ada pesanan</p>
              <p className="text-sm text-subtext">Mulai pesan dimsum favoritmu!</p>
            </div>
            <Link
              href="/menu"
              className="bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-full"
            >
              Pesan Sekarang
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="px-4 space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.order_code}`}>
                <div
                  className={`bg-white rounded-2xl p-4 border-l-4 ${STATUS_BORDER[order.status]} shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* Row 1: code + badge */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono font-semibold text-sm text-body-text">
                      {order.order_code}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  {/* Row 2: item count + price */}
                  <p className="text-sm text-subtext mt-1.5">
                    {order.items.length} item · {formatRupiah(order.total)}
                  </p>

                  {/* Row 3: date */}
                  <p className="text-xs text-subtext mt-1">{formatDate(order.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

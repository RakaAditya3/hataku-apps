"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { getAdminOrders } from "@/lib/api/admin";
import { formatRupiah } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/api";

const TABS: { label: string; value: string }[] = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "pending" },
  { label: "Diproses", value: "in_progress" },
  { label: "Selesai", value: "done" },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending:     { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  paid:        { label: "Dibayar", className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "Diproses", className: "bg-orange-100 text-orange-700" },
  done:        { label: "Selesai", className: "bg-green-100 text-green-700" },
  cancelled:   { label: "Dibatalkan", className: "bg-neutral-100 text-neutral-500" },
  expired:     { label: "Expired", className: "bg-neutral-100 text-neutral-400" },
};

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getAdminOrders(token, activeTab || undefined);
      setOrders(res.data);
    } catch {
      // silently fail — will retry on next interval
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchOrders, 30_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Pesanan</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? "bg-red-600 text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-sm">
          Tidak ada pesanan
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status];
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.order_code}`}
                className="block bg-white rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-neutral-900 font-mono">
                        {order.order_code}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">
                      {order.user?.name ?? "—"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {order.order_type === "dine_in" ? "Dine In" : "Takeaway"}
                      {" · "}
                      {order.items.length} item
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-neutral-900">
                      {formatRupiah(order.total)}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDate(order.created_at)} {formatTime(order.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

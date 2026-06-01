"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { getAdminOrder, markOrderDone, adminCancelOrder } from "@/lib/api/admin";
import { formatRupiah } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/api";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:     { label: "Menunggu Pembayaran", className: "bg-yellow-100 text-yellow-700" },
  paid:        { label: "Dibayar", className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "Sedang Diproses", className: "bg-orange-100 text-orange-700" },
  done:        { label: "Selesai", className: "bg-green-100 text-green-700" },
  cancelled:   { label: "Dibatalkan", className: "bg-neutral-100 text-neutral-500" },
  expired:     { label: "Expired", className: "bg-neutral-100 text-neutral-400" },
};

function TimelineItem({ label, time, active }: { label: string; time?: string | null; active: boolean }) {
  return (
    <div className={`flex gap-3 ${!active ? "opacity-40" : ""}`}>
      <div className="flex flex-col items-center">
        <div
          className={`w-2.5 h-2.5 rounded-full mt-0.5 ${active ? "bg-red-500" : "bg-neutral-300"}`}
        />
        <div className="w-px flex-1 bg-neutral-200 mt-1" />
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {time && (
          <p className="text-xs text-neutral-400 mt-0.5">
            {new Date(time).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, admin } = useAdminAuth();
  const code = params.code as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getAdminOrder(code, token);
      setOrder(res.data);
    } catch {
      toast.error("Pesanan tidak ditemukan");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [token, code, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchOrder, 30_000);
    return () => clearInterval(id);
  }, [fetchOrder]);

  async function handleDone() {
    if (!order || !token) return;
    setActionLoading(true);
    try {
      const res = await markOrderDone(order.order_code, token);
      setOrder(res.data);
      toast.success("Pesanan ditandai selesai");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!order || !token) return;
    if (!confirm(`Batalkan pesanan ${order.order_code}? Tindakan ini tidak dapat diurungkan.`)) return;
    setActionLoading(true);
    try {
      const res = await adminCancelOrder(order.order_code, token);
      setOrder(res.data);
      toast.success("Pesanan dibatalkan");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!order) return null;

  const status = STATUS_CONFIG[order.status];

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="text-sm text-neutral-400 hover:text-neutral-700 mb-4 flex items-center gap-1"
      >
        ← Kembali
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Kode Pesanan</p>
            <p className="text-lg font-bold font-mono text-neutral-900">{order.order_code}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-neutral-400 text-xs">Customer</p>
            <p className="font-medium text-neutral-800">{order.user?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-xs">Tipe</p>
            <p className="font-medium text-neutral-800">
              {order.order_type === "dine_in" ? "Dine In" : "Takeaway"}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Item Pesanan
        </p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-neutral-800">
                  {item.product_name} <span className="text-neutral-400">×{item.quantity}</span>
                </p>
                {item.options.length > 0 && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {item.options.map((o) => o.option_name).join(", ")}
                  </p>
                )}
              </div>
              <span className="text-neutral-700 shrink-0">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-100 mt-4 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-neutral-500">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Diskon Promo</span>
              <span>−{formatRupiah(order.discount_amount)}</span>
            </div>
          )}
          {order.points_value > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Point Redeem ({order.points_redeemed} pt)</span>
              <span>−{formatRupiah(order.points_value)}</span>
            </div>
          )}
          {order.reward_discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Reward</span>
              <span>−{formatRupiah(order.reward_discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-1 border-t border-neutral-100">
            <span>Total</span>
            <span className="text-red-600">{formatRupiah(order.total)}</span>
          </div>
        </div>

        {order.points_earned != null && (
          <div className="mt-3 p-2.5 bg-green-50 rounded-lg text-sm text-green-700 font-medium">
            +{order.points_earned} point diberikan ke customer
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
          Timeline
        </p>
        <div>
          <TimelineItem label="Pesanan dibuat" time={order.created_at} active />
          <TimelineItem label="Pembayaran dikonfirmasi" time={order.paid_at} active={!!order.paid_at} />
          <TimelineItem label="Selesai" time={order.done_at} active={!!order.done_at} />
          {order.cancelled_at && (
            <TimelineItem label="Dibatalkan" time={order.cancelled_at} active />
          )}
        </div>
      </div>

      {/* Actions */}
      {(order.status === "in_progress" || (admin?.role === "admin" && ["pending", "paid", "in_progress"].includes(order.status))) && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
          {order.status === "in_progress" && (
            <button
              onClick={handleDone}
              disabled={actionLoading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm"
            >
              {actionLoading ? "Memproses..." : "✅ Tandai Selesai"}
            </button>
          )}
          {admin?.role === "admin" && ["pending", "paid", "in_progress"].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 font-medium rounded-xl text-sm"
            >
              {actionLoading ? "Memproses..." : "❌ Batalkan Pesanan"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

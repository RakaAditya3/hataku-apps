"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAdminCustomer } from "@/lib/api/admin-customers";
import { useAdminAuth } from "@/lib/store/admin-auth";
import type { AdminCustomerDetail, CustomerTier, OrderStatus, PointTransaction } from "@/types/api";

const TIER_LABELS: Record<CustomerTier, string> = {
  bamboo:   "Bamboo",
  jade:     "Jade",
  imperial: "Imperial",
  dragon:   "Dragon",
};

const TIER_COLORS: Record<CustomerTier, string> = {
  bamboo:   "bg-green-100 text-green-700 border-green-200",
  jade:     "bg-teal-100 text-teal-700 border-teal-200",
  imperial: "bg-purple-100 text-purple-700 border-purple-200",
  dragon:   "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:     "Menunggu",
  paid:        "Dibayar",
  in_progress: "Diproses",
  done:        "Selesai",
  cancelled:   "Dibatalkan",
  expired:     "Kedaluwarsa",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid:        "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-orange-100 text-orange-700 border-orange-200",
  done:        "bg-green-100 text-green-700 border-green-200",
  cancelled:   "bg-red-100 text-red-700 border-red-200",
  expired:     "bg-neutral-100 text-neutral-500 border-neutral-200",
};

const POINT_TYPE_LABELS: Record<PointTransaction["type"], string> = {
  earn:       "Earn",
  redeem:     "Redeem",
  refund:     "Refund",
  referral:   "Referral",
  checkin:    "Check-in",
  adjustment: "Adjustment",
};

function formatPrice(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminCustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();

  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    getAdminCustomer(Number(id), token)
      .then((res) => setCustomer(res.data))
      .catch(() => toast.error("Gagal memuat data customer"))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) {
    return <div className="text-center py-16 text-neutral-400 text-sm">Memuat data...</div>;
  }

  if (!customer) {
    return <div className="text-center py-16 text-neutral-400 text-sm">Customer tidak ditemukan</div>;
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
      >
        ← Kembali
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-neutral-100 overflow-hidden flex-shrink-0">
            {customer.avatar_url ? (
              <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300 text-2xl">
                👤
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-neutral-900">{customer.name}</h2>
              <Badge variant="outline" className={`text-xs ${TIER_COLORS[customer.tier]}`}>
                {TIER_LABELS[customer.tier]}
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5">{customer.email}</p>
            <p className="text-sm text-neutral-500">{customer.phone ?? "No. telepon belum diisi"}</p>
            <p className="text-xs text-neutral-400 mt-1">Bergabung {formatDate(customer.created_at)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100">
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">{customer.point_balance.toLocaleString("id-ID")}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Point</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">{customer.valid_transaction_count}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Transaksi Valid</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">{customer.current_streak}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Streak Hari</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900">Pesanan Terakhir</h3>
        </div>
        {customer.recent_orders.length === 0 ? (
          <p className="text-center py-8 text-sm text-neutral-400">Belum ada pesanan</p>
        ) : (
          <div className="divide-y divide-neutral-50">
            {customer.recent_orders.map((order) => (
              <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono font-medium text-neutral-800">{order.order_code}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-900">{formatPrice(order.total)}</span>
                  <Badge variant="outline" className={`text-xs ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Point history */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <h3 className="font-semibold text-neutral-900">Riwayat Point</h3>
        </div>
        {customer.recent_point_transactions.length === 0 ? (
          <p className="text-center py-8 text-sm text-neutral-400">Belum ada transaksi point</p>
        ) : (
          <div className="divide-y divide-neutral-50">
            {customer.recent_point_transactions.map((pt) => (
              <div key={pt.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        pt.amount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {pt.amount >= 0 ? "+" : ""}{pt.amount} pt
                    </span>
                    <span className="text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {POINT_TYPE_LABELS[pt.type]}
                    </span>
                  </div>
                  {pt.note && <p className="text-xs text-neutral-400 mt-0.5">{pt.note}</p>}
                  {pt.order_code && (
                    <p className="text-xs text-neutral-400 font-mono">{pt.order_code}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600">{pt.balance_after.toLocaleString("id-ID")} pt</p>
                  <p className="text-xs text-neutral-400">{formatDateTime(pt.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

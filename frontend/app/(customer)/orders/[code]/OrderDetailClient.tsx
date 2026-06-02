"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { getOrder, cancelOrder } from "@/lib/api/orders";
import { formatRupiah } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/api";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:     "⏳ Menunggu Scan",
  paid:        "👨‍🍳 Sedang Dibuat",
  in_progress: "👨‍🍳 Sedang Dibuat",
  done:        "✅ Selesai",
  cancelled:   "❌ Dibatalkan",
  expired:     "⌛ Kedaluwarsa",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending:     "bg-amber-50 text-amber-700",
  paid:        "bg-blue-50 text-blue-700",
  in_progress: "bg-blue-50 text-blue-700",
  done:        "bg-green-50 text-green-700",
  cancelled:   "bg-red-50 text-red-700",
  expired:     "bg-gray-50 text-gray-500",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:     "bg-amber-100 text-amber-700",
  paid:        "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  done:        "bg-green-100 text-green-700",
  cancelled:   "bg-red-100 text-red-700",
  expired:     "bg-gray-100 text-gray-500",
};

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function compute() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Sudah kedaluwarsa"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft(
        h > 0
          ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }
    compute();
    const id = setInterval(compute, 1_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <p className="text-sm text-price mt-1">Berlaku hingga {timeLeft}</p>
  );
}

export function OrderDetailClient({ code }: { code: string }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!session?.user.sanctumToken) return;
    try {
      const res = await getOrder(code, session.user.sanctumToken);
      if (res.success) setOrder(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [code, session?.user.sanctumToken]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") { router.push("/login"); return; }
    if (sessionStatus !== "authenticated") return;
    fetchOrder();
    const id = setInterval(fetchOrder, 30_000);
    return () => clearInterval(id);
  }, [sessionStatus, fetchOrder, router]);

  async function handleCancel() {
    if (!session?.user.sanctumToken || !order) return;
    setCancelling(true);
    try {
      const res = await cancelOrder(order.order_code, session.user.sanctumToken);
      if (res.success) setOrder(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membatalkan pesanan");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-subtext">Memuat pesanan...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-price">{error ?? "Pesanan tidak ditemukan"}</p>
        <button
          onClick={() => router.push("/orders")}
          className="border border-hairline text-body-text rounded-full px-6 py-2 text-sm font-semibold"
        >
          Kembali ke Pesanan
        </button>
      </main>
    );
  }

  const showQR = order.status === "pending" || order.status === "paid";

  return (
    <main className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => router.push("/orders")}
          className="text-subtext hover:text-body-text text-xl leading-none w-8"
        >
          ←
        </button>
        <h1 className="flex-1 font-bold text-base text-body-text">Detail Pesanan</h1>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>
          {STATUS_LABEL[order.status].replace(/^.{2}/, "").trim()}
        </span>
      </header>

      <div className="space-y-3 mt-1">
        {/* QR Card */}
        {showQR && (
          <section className="mx-4 bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="p-3 bg-white border border-hairline rounded-2xl">
              <QRCodeSVG value={order.order_code} size={200} />
            </div>
            <p className="font-mono font-bold text-lg text-primary-dark mt-4 tracking-widest">
              {order.order_code}
            </p>
            <p className="text-xs text-subtext mt-1">Tunjukkan ke kasir untuk membayar</p>
            {order.expires_at && <ExpiryCountdown expiresAt={order.expires_at} />}
          </section>
        )}

        {/* Status Badge Besar */}
        <section className={`mx-4 rounded-2xl p-4 ${STATUS_STYLE[order.status]}`}>
          <p className="font-semibold text-sm text-center">{STATUS_LABEL[order.status]}</p>
          {!showQR && (
            <p className="text-xs text-center opacity-70 mt-0.5 font-mono">{order.order_code}</p>
          )}
        </section>

        {/* Poin Earned (jika done) */}
        {order.status === "done" && order.points_earned != null && order.points_earned > 0 && (
          <section className="mx-4 bg-primary/10 rounded-xl px-4 py-4 text-center">
            <p className="text-sm text-primary">
              🎉 Selamat! Kamu mendapat{" "}
              <span className="font-bold">{order.points_earned} poin</span> dari pesanan ini
            </p>
          </section>
        )}

        {/* Detail Pesanan */}
        <section className="mx-4 bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-hairline">
            <p className="font-semibold text-sm text-primary-dark">Pesanan</p>
          </div>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="px-4 py-3 flex justify-between gap-2 border-b border-hairline last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-body-text">{item.product_name}</p>
                {item.options.length > 0 && (
                  <p className="text-xs text-subtext mt-0.5">
                    Saus: {item.options.map((o) => o.option_name).join(", ")}
                  </p>
                )}
                <p className="text-xs text-subtext mt-0.5">
                  {item.quantity} × {formatRupiah(item.product_price)}
                </p>
              </div>
              <p className="text-sm font-semibold text-price shrink-0">{formatRupiah(item.subtotal)}</p>
            </div>
          ))}

          {/* Pricing summary */}
          <div className="px-4 py-3 space-y-2 text-sm border-t border-hairline">
            <div className="flex justify-between">
              <span className="text-subtext">Subtotal</span>
              <span className="text-body-text">{formatRupiah(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Diskon Promo{order.promo_code_used ? ` (${order.promo_code_used})` : ""}
                </span>
                <span>− {formatRupiah(order.discount_amount)}</span>
              </div>
            )}
            {order.points_value > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon Poin ({order.points_redeemed} pt)</span>
                <span>− {formatRupiah(order.points_value)}</span>
              </div>
            )}
            {order.reward_discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon Reward</span>
                <span>− {formatRupiah(order.reward_discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-hairline pt-2">
              <span className="text-body-text">Total</span>
              <span className="text-body-text">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mx-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tombol Batalkan */}
        {order.status === "pending" && (
          <div className="mx-4 mt-2">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full h-12 border-2 border-price text-price bg-transparent rounded-full font-semibold text-sm disabled:opacity-60"
            >
              {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
            </button>
          </div>
        )}

        {["done", "cancelled", "expired"].includes(order.status) && (
          <div className="mx-4 mt-2 mb-4">
            <button
              onClick={() => router.push("/menu")}
              className="w-full h-12 bg-primary text-white rounded-full font-semibold text-sm"
            >
              Pesan Lagi
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

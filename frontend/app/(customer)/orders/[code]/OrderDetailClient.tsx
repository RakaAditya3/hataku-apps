"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { getOrder, cancelOrder } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";
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

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function compute() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Sudah kadaluarsa"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setTimeLeft(`${h} jam ${m} menit`);
    }
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <span className="text-xs text-muted-foreground">Kedaluwarsa dalam {timeLeft}</span>
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
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (sessionStatus !== "authenticated") return;

    fetchOrder();

    // Poll every 30 seconds
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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Memuat pesanan...</p>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" onClick={() => router.push("/orders")}>Kembali ke Pesanan</Button>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted-foreground">Pesanan tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.push("/orders")}>Kembali</Button>
      </main>
    );
  }

  const isTerminal = ["done", "cancelled", "expired"].includes(order.status);

  return (
    <main className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/orders")} className="text-muted-foreground hover:text-foreground text-sm font-medium">
          ← Pesanan
        </button>
        <h1 className="text-base font-bold flex-1">Detail Pesanan</h1>
        <Badge className={`text-xs border ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </Badge>
      </header>

      <div className="px-4 py-5 space-y-6">
        {/* QR Code section */}
        {order.status === "pending" && (
          <section className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-2xl bg-white border p-4 shadow-sm">
              <QRCodeSVG value={order.order_code} size={200} />
            </div>
            <div className="text-center">
              <p className="font-mono font-black text-xl tracking-widest">{order.order_code}</p>
              <p className="text-xs text-muted-foreground mt-1">Tunjukkan QR ini ke kasir</p>
              {order.expires_at && <ExpiryCountdown expiresAt={order.expires_at} />}
            </div>
          </section>
        )}

        {/* Non-pending status info */}
        {order.status !== "pending" && (
          <section className="rounded-xl border bg-card px-4 py-4 text-center space-y-1">
            <p className="font-mono font-bold text-base tracking-wider">{order.order_code}</p>
            <p className="text-sm text-muted-foreground">
              {order.order_type === "dine_in" ? "Makan di Tempat" : "Bawa Pulang"}
            </p>
            {order.status === "done" && order.points_earned !== null && (
              <p className="text-sm text-green-600 font-semibold">+{order.points_earned} poin earned</p>
            )}
          </section>
        )}

        {/* Order items */}
        <section>
          <p className="text-sm font-semibold mb-2">Pesanan</p>
          <div className="rounded-xl border bg-card divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="px-4 py-3 flex justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.product_name}</p>
                  {item.options.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.options.map((opt) => (
                        <span key={opt.id} className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {opt.option_name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.quantity} × {formatRupiah(item.product_price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-orange-600 flex-shrink-0">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing summary */}
        <section className="rounded-xl border bg-card px-4 py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon Promo {order.promo_code_used ? `(${order.promo_code_used})` : ""}</span>
              <span>− {formatRupiah(order.discount_amount)}</span>
            </div>
          )}
          {order.points_value > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon Point ({order.points_redeemed} pt)</span>
              <span>− {formatRupiah(order.points_value)}</span>
            </div>
          )}
          {order.reward_discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon Reward</span>
              <span>− {formatRupiah(order.reward_discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-base border-t pt-2">
            <span>Total</span>
            <span className="text-orange-600">{formatRupiah(order.total)}</span>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Cancel button */}
        {order.status === "pending" && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold"
          >
            {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
          </Button>
        )}

        {isTerminal && (
          <Button onClick={() => router.push("/menu")} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
            Pesan Lagi
          </Button>
        )}
      </div>
    </main>
  );
}

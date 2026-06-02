"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/lib/api/orders";
import { validatePromo, type PromoValidateResult } from "@/lib/api/promos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils/format";
import type { CreateOrderPayload } from "@/types/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();

  const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoResult, setPromoResult] = useState<PromoValidateResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [pointsInput, setPointsInput] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Points conversion: 100 pt = Rp 5.000
  const pointsValue = Math.floor(pointsToRedeem / 100) * 5000;
  const discountAmount = promoResult?.discount_amount ?? 0;
  const total = Math.max(0, totalPrice - discountAmount - pointsValue);

  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code) return;
    setPromoError(null);
    setPromoLoading(true);
    try {
      const res = await validatePromo(code, totalPrice);
      if (res.success) {
        setPromoResult(res.data);
        setPromoApplied(true);
      } else {
        setPromoError("Kode promo tidak valid");
      }
    } catch (e) {
      setPromoError(e instanceof Error ? e.message : "Kode promo tidak valid");
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    setPromoApplied(false);
    setPromoResult(null);
    setPromoCode("");
    setPromoError(null);
  }

  function handleApplyPoints() {
    const parsed = parseInt(pointsInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setPointsToRedeem(parsed);
    }
  }

  async function handleSubmit() {
    if (!session?.user.sanctumToken) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      setError("Keranjang kosong");
      return;
    }

    setError(null);
    setLoading(true);

    const payload: CreateOrderPayload = {
      order_type: orderType,
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        selected_options: item.selectedOptions.map((opt) => ({
          option_group_id: opt.optionGroupId,
          option_item_id: opt.optionItemId,
        })),
      })),
      ...(promoApplied && promoResult ? { promo_code: promoResult.code } : {}),
      ...(pointsToRedeem > 0 ? { points_to_redeem: pointsToRedeem } : {}),
    };

    try {
      const res = await createOrder(payload, session.user.sanctumToken);
      if (res.success) {
        clearCart();
        router.push(`/orders/${res.data.order_code}`);
      } else {
        setError("Gagal membuat pesanan");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground text-sm font-medium">
            ← Kembali
          </button>
          <h1 className="text-base font-bold">Checkout</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <p className="font-bold text-lg">Keranjang kosong</p>
          <Button onClick={() => router.push("/menu")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
            Lihat Menu
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground text-sm font-medium">
          ← Kembali
        </button>
        <h1 className="text-base font-bold">Checkout</h1>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Order type */}
        <section>
          <p className="text-sm font-semibold mb-2">Jenis Pesanan</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderType("dine_in")}
              className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                orderType === "dine_in"
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-border text-muted-foreground hover:border-orange-300"
              }`}
            >
              Makan di Tempat
            </button>
            <button
              onClick={() => setOrderType("takeaway")}
              className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                orderType === "takeaway"
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-border text-muted-foreground hover:border-orange-300"
              }`}
            >
              Bawa Pulang
            </button>
          </div>
        </section>

        {/* Cart summary */}
        <section>
          <p className="text-sm font-semibold mb-2">Ringkasan Pesanan</p>
          <div className="rounded-xl border bg-card divide-y">
            {items.map((item, index) => (
              <div key={index} className="px-4 py-3 flex justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{item.productName}</p>
                  {item.selectedOptions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.selectedOptions.map((opt, i) => (
                        <span key={i} className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {opt.optionName}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.quantity} × {formatRupiah(item.productPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-orange-600 shrink-0">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Promo code */}
        <section>
          <p className="text-sm font-semibold mb-2">Kode Promo (Opsional)</p>
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kode promo"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); if (promoApplied) handleRemovePromo(); }}
              className="flex-1 text-sm"
              disabled={promoApplied}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={promoApplied ? handleRemovePromo : handleApplyPromo}
              disabled={promoLoading}
              className="text-xs font-semibold px-4"
            >
              {promoLoading ? "..." : promoApplied ? "Hapus" : "Terapkan"}
            </Button>
          </div>
          {promoApplied && promoResult && (
            <p className="text-xs text-green-600 mt-1">
              {promoResult.title} — hemat {formatRupiah(promoResult.discount_amount)}
            </p>
          )}
          {promoError && (
            <p className="text-xs text-red-600 mt-1">{promoError}</p>
          )}
        </section>

        {/* Points redemption */}
        <section>
          <p className="text-sm font-semibold mb-1">Gunakan Point</p>
          <p className="text-xs text-muted-foreground mb-2">100 pt = Rp 5.000</p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Jumlah point (kelipatan 100)"
              value={pointsInput}
              onChange={(e) => setPointsInput(e.target.value)}
              min={0}
              step={100}
              className="flex-1 text-sm"
            />
            <Button variant="outline" size="sm" onClick={handleApplyPoints} className="text-xs font-semibold px-4">
              Terapkan
            </Button>
          </div>
          {pointsToRedeem > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {pointsToRedeem} pt → hemat {formatRupiah(pointsValue)}
            </p>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Fixed bottom summary + CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-4 space-y-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatRupiah(totalPrice)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon Promo</span>
              <span>− {formatRupiah(discountAmount)}</span>
            </div>
          )}
          {pointsToRedeem > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon Point</span>
              <span>− {formatRupiah(pointsValue)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-base pt-1 border-t">
            <span>Total</span>
            <span className="text-orange-600">{formatRupiah(total)}</span>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Buat Pesanan"}
        </Button>
      </div>
    </main>
  );
}

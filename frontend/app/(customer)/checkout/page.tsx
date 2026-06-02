"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/lib/api/orders";
import { validatePromo, type PromoValidateResult } from "@/lib/api/promos";
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
  const [usePoints, setUsePoints] = useState(false);
  const [pointsInput, setPointsInput] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pointsValue = Math.floor(pointsToRedeem / 100) * 5000;
  const discountAmount = promoResult?.discount_amount ?? 0;
  const total = Math.max(0, totalPrice - discountAmount - pointsValue);
  const potentialPoints = Math.floor(total / 1000);

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

  function handleTogglePoints(on: boolean) {
    setUsePoints(on);
    if (!on) {
      setPointsToRedeem(0);
      setPointsInput("");
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
      <main className="min-h-screen bg-cream flex flex-col">
        <header className="sticky top-0 z-10 bg-cream px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="text-subtext hover:text-body-text text-xl leading-none w-8"
          >
            ←
          </button>
          <h1 className="flex-1 text-center font-bold text-base text-body-text">Checkout</h1>
          <div className="w-8" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <span className="text-5xl">🛒</span>
          <p className="font-semibold text-base text-primary-dark">Keranjang kosong</p>
          <button
            onClick={() => router.push("/menu")}
            className="bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-full"
          >
            Lihat Menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream px-4 py-3 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-subtext hover:text-body-text text-xl leading-none w-8"
        >
          ←
        </button>
        <h1 className="flex-1 text-center font-bold text-base text-body-text">Checkout</h1>
        <div className="w-8" />
      </header>

      <div className="space-y-3 mt-1 pb-2">
        {/* Tipe Pesanan */}
        <section className="mx-4">
          <p className="font-semibold text-sm text-primary-dark mb-2">Tipe Pesanan</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "dine_in", emoji: "🪑", label: "Dine In", sub: "Makan di tempat" },
                { value: "takeaway", emoji: "🥡", label: "Take Away", sub: "Bawa pulang" },
              ] as const
            ).map(({ value, emoji, label, sub }) => (
              <button
                key={value}
                onClick={() => setOrderType(value)}
                className={`rounded-2xl p-4 border-2 text-left transition-colors ${
                  orderType === value
                    ? "border-primary bg-primary/5"
                    : "border-hairline bg-white"
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <p className="font-bold text-sm text-body-text mt-1">{label}</p>
                <p className="text-xs text-subtext">{sub}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Detail Pesanan */}
        <section className="mx-4 bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-hairline">
            <p className="font-semibold text-sm text-primary-dark">Detail Pesanan</p>
          </div>
          {items.map((item, index) => (
            <div
              key={index}
              className="px-4 py-3 flex justify-between gap-2 border-b border-hairline last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-body-text leading-snug">{item.productName}</p>
                {item.selectedOptions.length > 0 && (
                  <p className="text-xs text-subtext mt-0.5">
                    Saus: {item.selectedOptions.map((o) => o.optionName).join(", ")}
                  </p>
                )}
              </div>
              <p className="text-xs text-subtext shrink-0 mt-0.5">
                {item.quantity} × {formatRupiah(item.productPrice)}
              </p>
            </div>
          ))}
        </section>

        {/* Voucher / Promo */}
        <section className="mx-4 bg-white rounded-2xl p-4">
          <p className="font-semibold text-sm text-primary-dark mb-2">Kode Promo</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan kode promo"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                if (promoApplied) handleRemovePromo();
              }}
              disabled={promoApplied}
              className="flex-1 h-11 px-3 rounded-xl border border-hairline text-sm text-body-text placeholder:text-subtext focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-subtext"
            />
            <button
              onClick={promoApplied ? handleRemovePromo : handleApplyPromo}
              disabled={promoLoading}
              className="bg-primary text-white font-semibold text-sm px-4 h-11 rounded-xl disabled:opacity-60"
            >
              {promoLoading ? "..." : promoApplied ? "Hapus" : "Pakai"}
            </button>
          </div>
          {promoApplied && promoResult && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              ✓ {promoResult.title} — hemat {formatRupiah(promoResult.discount_amount)}
            </p>
          )}
          {promoError && (
            <p className="text-xs text-price mt-2">{promoError}</p>
          )}
        </section>

        {/* Gunakan Poin */}
        {session?.user && (
          <section className="mx-4 bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🪙</span>
                <span className="text-sm font-semibold text-primary-dark">Gunakan Poin</span>
              </div>
              <button
                onClick={() => handleTogglePoints(!usePoints)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  usePoints ? "bg-primary" : "bg-hairline"
                }`}
                role="switch"
                aria-checked={usePoints}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    usePoints ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {usePoints && (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Jumlah poin (kelipatan 100)"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    min={0}
                    step={100}
                    className="flex-1 h-11 px-3 rounded-xl border border-hairline text-sm text-body-text placeholder:text-subtext focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleApplyPoints}
                    className="bg-primary text-white font-semibold text-sm px-4 h-11 rounded-xl"
                  >
                    Pakai
                  </button>
                </div>
                <p className="text-xs text-subtext mt-1.5">100 poin = Rp 5.000</p>
                {pointsToRedeem > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {pointsToRedeem} poin → hemat {formatRupiah(pointsValue)}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Potensi Poin */}
        {potentialPoints > 0 && (
          <section className="mx-4 bg-primary/10 rounded-xl px-4 py-3">
            <p className="text-sm text-primary">
              🪙 Kamu berpotensi mendapat{" "}
              <span className="font-bold">{potentialPoints} poin</span> dari pesanan ini
            </p>
          </section>
        )}

        {/* Rincian Pembayaran */}
        <section className="mx-4 bg-white rounded-2xl p-4">
          <p className="font-semibold text-sm text-primary-dark mb-3">Rincian Pembayaran</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-subtext">Subtotal</span>
              <span className="text-body-text">{formatRupiah(totalPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon Promo</span>
                <span>− {formatRupiah(discountAmount)}</span>
              </div>
            )}
            {pointsToRedeem > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon Poin</span>
                <span>− {formatRupiah(pointsValue)}</span>
              </div>
            )}
            <div className="border-t border-hairline pt-2 flex justify-between font-bold text-base">
              <span className="text-body-text">Total</span>
              <span className="text-body-text">{formatRupiah(total)}</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mx-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hairline px-4 py-3 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-primary text-white font-semibold text-base rounded-full disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </>
          ) : (
            `Buat Pesanan — ${formatRupiah(total)}`
          )}
        </button>
      </div>
    </main>
  );
}

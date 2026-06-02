"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils/format";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();

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
          <h1 className="flex-1 text-center font-bold text-base text-body-text">
            Keranjang
          </h1>
          <div className="w-8" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <span className="text-6xl">🛒</span>
          <div className="space-y-1">
            <p className="font-semibold text-base text-primary-dark">Keranjang kosong</p>
            <p className="text-sm text-subtext">Yuk tambah dimsum favoritmu!</p>
          </div>
          <Link
            href="/menu"
            className="bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-full"
          >
            Lihat Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-44">
      <header className="sticky top-0 z-10 bg-cream px-4 py-3 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-subtext hover:text-body-text text-xl leading-none w-8"
        >
          ←
        </button>
        <h1 className="flex-1 text-center font-bold text-base text-body-text">
          Keranjang
        </h1>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {totalItems} item
        </span>
      </header>

      {/* Item list */}
      <div className="px-4 mt-2 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-3">
            <div className="flex gap-3">
              {/* Product image fallback */}
              <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary/20 to-primary-dark/20 shrink-0 flex items-center justify-center">
                <span className="text-2xl">🥟</span>
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-primary-dark leading-snug">
                  {item.productName}
                </p>
                {item.selectedOptions.length > 0 && (
                  <p className="text-xs text-subtext mt-0.5">
                    Saus: {item.selectedOptions.map((o) => o.optionName).join(", ")}
                  </p>
                )}
                <p className="font-bold text-sm text-price mt-1">
                  {formatRupiah(item.subtotal)}
                </p>
              </div>
            </div>

            {/* Row 2: delete + qty controls */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => removeItem(index)}
                className="text-xs text-subtext hover:text-price flex items-center gap-1 transition-colors"
                aria-label="Hapus item"
              >
                🗑️ Hapus
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-7 h-7 rounded-full border border-primary flex items-center justify-center text-primary font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-sm text-body-text">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                  className="w-7 h-7 rounded-full border border-primary flex items-center justify-center text-primary font-bold text-base"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4">
        <div className="flex justify-between text-sm">
          <span className="text-subtext">Subtotal</span>
          <span className="text-body-text">{formatRupiah(totalPrice)}</span>
        </div>
        <div className="border-t border-hairline mt-3 pt-3 flex justify-between">
          <span className="font-bold text-sm text-body-text">Total</span>
          <span className="font-bold text-sm text-body-text">{formatRupiah(totalPrice)}</span>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hairline px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm text-primary-dark">Total</span>
          <span className="font-bold text-base text-primary-dark">{formatRupiah(totalPrice)}</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full bg-primary text-white font-semibold text-base text-center py-3 rounded-full"
        >
          Lanjut ke Checkout →
        </Link>
      </div>
    </main>
  );
}

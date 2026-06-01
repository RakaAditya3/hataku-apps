"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils/format";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground text-sm font-medium">
            ← Kembali
          </button>
          <h1 className="text-base font-bold">Keranjang</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <span className="text-6xl">🛒</span>
          <div className="space-y-1">
            <p className="font-bold text-lg">Keranjang kosong</p>
            <p className="text-sm text-muted-foreground">
              Yuk pilih menu favoritmu dulu!
            </p>
          </div>
          <Link href="/menu">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
              Lihat Menu
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-36">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground text-sm font-medium"
        >
          ← Kembali
        </button>
        <h1 className="text-base font-bold">Keranjang</h1>
        <span className="text-xs text-muted-foreground ml-auto">
          {items.reduce((s, i) => s + i.quantity, 0)} item
        </span>
      </header>

      <div className="px-4 py-3 space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            {/* Product name + remove */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">
                  {item.productName}
                </p>
                {item.selectedOptions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.selectedOptions.map((opt, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                      >
                        {opt.optionName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeItem(index)}
                className="text-muted-foreground hover:text-destructive text-lg flex-shrink-0 leading-none"
                aria-label="Hapus item"
              >
                ✕
              </button>
            </div>

            {/* Qty + subtotal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 border rounded-xl px-2 py-1">
                <button
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center text-base font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-base font-bold text-muted-foreground hover:text-foreground"
                >
                  +
                </button>
              </div>
              <p className="font-bold text-sm text-orange-600">
                {formatRupiah(item.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary + checkout */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-black text-lg">{formatRupiah(totalPrice)}</span>
        </div>
        <Link href="/checkout" className="block">
          <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold">
            Lanjut ke Checkout
          </Button>
        </Link>
      </div>
    </main>
  );
}

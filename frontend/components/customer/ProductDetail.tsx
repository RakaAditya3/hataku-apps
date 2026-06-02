"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils/format";
import type { Product, OptionGroup } from "@/types/api";

interface ProductDetailProps {
  product: Product;
}

type Selection = Record<number, number[]>;

function isGroupSatisfied(group: OptionGroup, selection: Selection): boolean {
  return (selection[group.id]?.length ?? 0) >= group.min_select;
}

function allSatisfied(product: Product, selection: Selection): boolean {
  return product.option_groups
    .filter((g) => g.is_required)
    .every((g) => isGroupSatisfied(g, selection));
}

function groupBadgeLabel(group: OptionGroup, isRadio: boolean): string {
  if (!group.is_required) return "Opsional";
  if (isRadio) return "Wajib, Pilih 1";
  if (group.min_select === group.max_select) return `Wajib, Pilih ${group.min_select}`;
  return `Wajib, Pilih ${group.min_select}–${group.max_select}`;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.totalItems);

  const [selection, setSelection] = useState<Selection>({});
  const [qty, setQty] = useState(1);

  const isRadio = (group: OptionGroup) => group.max_select === 1;

  const toggleOption = (group: OptionGroup, itemId: number) => {
    setSelection((prev) => {
      const current = prev[group.id] ?? [];
      if (isRadio(group)) {
        return { ...prev, [group.id]: [itemId] };
      }
      if (current.includes(itemId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== itemId) };
      }
      if (current.length >= group.max_select) return prev;
      return { ...prev, [group.id]: [...current, itemId] };
    });
  };

  const canAdd = product.is_available && allSatisfied(product, selection);
  const estimatedPoints = Math.floor((product.price * qty) / 1000);

  const handleAddToCart = () => {
    if (!canAdd) return;

    const selectedOptions = product.option_groups.flatMap((group) =>
      (selection[group.id] ?? []).map((itemId) => {
        const item = group.items.find((i) => i.id === itemId)!;
        return {
          optionGroupId: group.id,
          optionGroupName: group.name,
          optionItemId: item.id,
          optionName: item.name,
        };
      })
    );

    addItem({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      quantity: qty,
      selectedOptions,
    });

    router.back();
  };

  return (
    <div className="pb-32">
      {/* Hero photo — 260px */}
      <div className="relative h-[260px] w-full bg-linear-to-br from-primary to-primary-dark">
        {product.photo_url && (
          <Image
            src={product.photo_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-lg font-semibold px-4 py-2 bg-black/40 rounded-xl">
              Menu Habis
            </span>
          </div>
        )}

        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
          aria-label="Kembali"
        >
          <ChevronLeft size={20} className="text-primary-dark" />
        </button>

        {/* Cart button */}
        <Link
          href="/cart"
          className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
          aria-label="Keranjang"
        >
          <ShoppingCart size={18} className="text-primary-dark" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-price text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* Content — overlaps photo by 6px */}
      <div className="relative z-10 -mt-6 rounded-t-3xl bg-cream px-4 pt-5">
        {/* Product info */}
        <h1 className="font-bold text-xl text-primary-dark">{product.name}</h1>
        <p className="font-bold text-lg text-price mt-1">
          {formatRupiah(product.price)}
        </p>
        {product.description && (
          <p className="text-sm text-subtext mt-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {product.option_groups.length > 0 && (
          <div className="mt-4 h-px bg-hairline" />
        )}

        {/* Option groups */}
        {product.option_groups.map((group) => {
          const radio = isRadio(group);
          const chosen = selection[group.id] ?? [];
          const satisfied = isGroupSatisfied(group, selection);

          return (
            <div key={group.id} className="mt-4">
              {/* Group header */}
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-primary-dark">{group.name}</h2>
                <div className="flex items-center gap-1.5">
                  {!radio && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-hairline text-subtext">
                      {chosen.length}/{group.max_select} dipilih
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      group.is_required && !satisfied
                        ? "bg-price/10 text-price"
                        : group.is_required && satisfied
                        ? "bg-success/10 text-success"
                        : "bg-hairline text-subtext"
                    }`}
                  >
                    {satisfied && group.is_required ? "✓ " : ""}
                    {groupBadgeLabel(group, radio)}
                  </span>
                </div>
              </div>

              {/* Option rows */}
              <div className="bg-white rounded-2xl overflow-hidden">
                {group.items
                  .filter((i) => i.is_active)
                  .map((item, idx, arr) => {
                    const selected = chosen.includes(item.id);
                    const disabled =
                      !selected && !radio && chosen.length >= group.max_select;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleOption(group, item.id)}
                        disabled={disabled}
                        className={`flex items-center justify-between w-full px-4 py-3 transition-colors ${
                          idx < arr.length - 1 ? "border-b border-hairline" : ""
                        } ${disabled ? "opacity-40" : "active:bg-primary/5"}`}
                      >
                        <span className="text-sm text-body-text">{item.name}</span>
                        <span
                          className={`w-5 h-5 ${
                            radio ? "rounded-full" : "rounded"
                          } border-2 flex items-center justify-center shrink-0 transition-colors ${
                            selected
                              ? "bg-primary border-primary"
                              : "border-hairline"
                          }`}
                        >
                          {selected && (
                            <span className="text-white text-[10px] leading-none font-bold">
                              ✓
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}

        {/* Points info */}
        <div className="mt-4 mb-4 bg-primary/10 rounded-xl p-3 flex items-center gap-2">
          <span className="text-base">🪙</span>
          <p className="text-sm text-primary">
            Potensi <span className="font-semibold">+{estimatedPoints} poin</span> dari pesanan ini
          </p>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-60 bg-white border-t border-hairline">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          {/* Qty controls */}
          <div className="flex items-center gap-2 border border-hairline rounded-full px-3 py-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="w-7 h-7 flex items-center justify-center text-primary-dark font-bold text-lg disabled:opacity-30"
            >
              −
            </button>
            <span className="w-5 text-center font-semibold text-sm text-body-text">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="w-7 h-7 flex items-center justify-center text-primary-dark font-bold text-lg"
            >
              +
            </button>
          </div>

          {/* Add to cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`flex-1 h-12 rounded-full font-semibold text-sm text-white transition-colors ${
              canAdd ? "bg-primary active:bg-primary-dark" : "bg-hairline"
            }`}
          >
            {!product.is_available
              ? "Menu Habis"
              : !allSatisfied(product, selection)
              ? "Lengkapi Pilihan"
              : `Tambah ke Keranjang — ${formatRupiah(product.price * qty)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

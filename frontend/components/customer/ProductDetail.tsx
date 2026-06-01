"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils/format";
import type { Product, OptionGroup } from "@/types/api";

interface ProductDetailProps {
  product: Product;
}

type Selection = Record<number, number[]>; // optionGroupId → optionItemId[]

function isGroupSatisfied(group: OptionGroup, selection: Selection): boolean {
  const chosen = selection[group.id]?.length ?? 0;
  return chosen >= group.min_select;
}

function allSatisfied(product: Product, selection: Selection): boolean {
  return product.option_groups
    .filter((g) => g.is_required)
    .every((g) => isGroupSatisfied(g, selection));
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [selection, setSelection] = useState<Selection>({});
  const [qty, setQty] = useState(1);

  const isRadio = (group: OptionGroup) => group.max_select === 1;

  const toggleOption = (group: OptionGroup, itemId: number) => {
    setSelection((prev) => {
      const current = prev[group.id] ?? [];
      if (isRadio(group)) {
        return { ...prev, [group.id]: [itemId] };
      }
      const already = current.includes(itemId);
      if (already) {
        return { ...prev, [group.id]: current.filter((id) => id !== itemId) };
      }
      if (current.length >= group.max_select) return prev;
      return { ...prev, [group.id]: [...current, itemId] };
    });
  };

  const canAdd = product.is_available && allSatisfied(product, selection);

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
      {/* Product photo */}
      <div className="relative aspect-square bg-muted w-full">
        {product.photo_url ? (
          <Image
            src={product.photo_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl">
            🥟
          </div>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Habis
            </Badge>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Name + price + category */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {product.category.name}
          </p>
          <h1 className="text-xl font-bold leading-tight">{product.name}</h1>
          <p className="text-2xl font-black text-orange-600 mt-1">
            {formatRupiah(product.price)}
          </p>
          {product.description && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Option groups */}
        {product.option_groups.map((group) => {
          const chosen = selection[group.id] ?? [];
          const satisfied = isGroupSatisfied(group, selection);
          const radio = isRadio(group);

          return (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">{group.name}</h2>
                {group.is_required && !satisfied && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    Wajib
                  </Badge>
                )}
                {group.is_required && satisfied && (
                  <Badge className="text-[10px] px-1.5 py-0 bg-green-500 hover:bg-green-500">
                    ✓
                  </Badge>
                )}
                {!radio && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Pilih {group.min_select === group.max_select
                      ? group.min_select
                      : `${group.min_select}–${group.max_select}`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {group.items
                  .filter((i) => i.is_active)
                  .map((item) => {
                    const selected = chosen.includes(item.id);
                    const disabled =
                      !selected &&
                      !radio &&
                      chosen.length >= group.max_select;

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleOption(group, item.id)}
                        disabled={disabled}
                        className={`
                          text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                          ${selected
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : disabled
                            ? "border-border bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                            : "border-border bg-background hover:border-orange-300 hover:bg-orange-50/30"
                          }
                        `}
                      >
                        {radio && (
                          <span className={`inline-block w-3.5 h-3.5 rounded-full border-2 mr-2 align-middle ${selected ? "border-orange-500 bg-orange-500" : "border-muted-foreground"}`} />
                        )}
                        {!radio && (
                          <span className={`inline-block w-3.5 h-3.5 rounded border-2 mr-2 align-middle ${selected ? "border-orange-500 bg-orange-500" : "border-muted-foreground"}`} />
                        )}
                        {item.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 flex items-center gap-3">
        {/* Quantity */}
        <div className="flex items-center gap-2 border rounded-xl px-2 py-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold text-muted-foreground hover:text-foreground disabled:opacity-30"
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="w-6 text-center font-semibold text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-8 h-8 flex items-center justify-center text-lg font-bold text-muted-foreground hover:text-foreground"
          >
            +
          </button>
        </div>

        {/* Add to cart */}
        <Button
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-40"
        >
          {!product.is_available
            ? "Menu Habis"
            : !allSatisfied(product, selection)
            ? "Lengkapi Pilihan"
            : `Tambah ke Keranjang — ${formatRupiah(product.price * qty)}`}
        </Button>
      </div>
    </div>
  );
}

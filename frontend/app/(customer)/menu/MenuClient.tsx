"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/customer/ProductCard";
import type { Category, Product } from "@/types/api";

interface MenuClientProps {
  categories: Category[];
  products: Product[];
}

export function MenuClient({ categories, products }: MenuClientProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategoryId !== null) {
      result = result.filter((p) => p.category.id === activeCategoryId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategoryId, search]);

  const grouped = useMemo(() => {
    if (activeCategoryId !== null || search.trim()) return null;
    const map = new Map<number, { category: Category; items: Product[] }>();
    for (const p of filtered) {
      if (!map.has(p.category.id)) {
        map.set(p.category.id, { category: p.category, items: [] });
      }
      map.get(p.category.id)!.items.push(p);
    }
    return Array.from(map.values());
  }, [filtered, activeCategoryId, search]);

  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : null;

  return (
    <>
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="w-full bg-white border border-hairline rounded-xl h-11 pl-9 pr-4 text-sm text-body-text placeholder:text-subtext focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        <button
          onClick={() => { setActiveCategoryId(null); setSearch(""); }}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            activeCategoryId === null
              ? "bg-primary text-white border-primary"
              : "bg-white border-hairline text-body-text"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategoryId(cat.id); setSearch(""); }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              activeCategoryId === cat.id
                ? "bg-primary text-white border-primary"
                : "bg-white border-hairline text-body-text"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-subtext text-sm">
            {search
              ? `Tidak ada hasil untuk "${search}"`
              : "Menu belum tersedia"}
          </div>
        ) : grouped ? (
          /* Semua — grouped by category */
          grouped.map(({ category, items }) => (
            <div key={category.id} className="mb-5">
              <h2 className="font-bold text-primary-dark mb-2">{category.name}</h2>
              <div className="space-y-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Filtered — flat list with optional header */
          <>
            {activeCategory && (
              <h2 className="font-bold text-primary-dark mb-2">
                {activeCategory.name}
              </h2>
            )}
            <div className="space-y-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

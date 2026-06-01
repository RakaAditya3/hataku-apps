"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/api";

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId: number | null;
}

export function CategoryFilter({
  categories,
  activeCategoryId,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (categoryId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null) {
      params.delete("category_id");
    } else {
      params.set("category_id", String(categoryId));
    }
    router.push(`/menu?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => handleSelect(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          activeCategoryId === null
            ? "bg-orange-500 text-white border-orange-500"
            : "bg-background text-foreground border-border hover:border-orange-400"
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeCategoryId === cat.id
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-background text-foreground border-border hover:border-orange-400"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

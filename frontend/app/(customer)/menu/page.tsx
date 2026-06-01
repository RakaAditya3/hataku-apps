import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/api/catalog";
import { ProductCard } from "@/components/customer/ProductCard";
import { CategoryFilter } from "./CategoryFilter";

interface MenuPageProps {
  searchParams: Promise<{ category_id?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const { category_id } = await searchParams;
  const activeCategoryId = category_id ? parseInt(category_id, 10) : null;

  const [categoriesRes, productsRes] = await Promise.allSettled([
    getCategories(),
    getProducts(activeCategoryId ?? undefined),
  ]);

  const categories =
    categoriesRes.status === "fulfilled" && categoriesRes.value.success
      ? categoriesRes.value.data
      : [];

  const products =
    productsRes.status === "fulfilled" && productsRes.value.success
      ? productsRes.value.data
      : [];

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ←
        </Link>
        <h1 className="text-base font-bold">Menu</h1>
      </header>

      {/* Category filter */}
      <div className="px-4 pt-4 pb-2">
        <Suspense>
          <CategoryFilter
            categories={categories}
            activeCategoryId={activeCategoryId}
          />
        </Suspense>
      </div>

      {/* Product grid */}
      <section className="px-4 pt-3">
        {products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {activeCategoryId
              ? "Tidak ada menu di kategori ini"
              : "Menu belum tersedia"}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {products.length} menu
              {activeCategoryId &&
                categories.find((c) => c.id === activeCategoryId)
                  ? ` · ${categories.find((c) => c.id === activeCategoryId)!.name}`
                  : ""}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-2 flex justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center gap-0.5 text-orange-600">
          <span className="text-xl">🥟</span>
          <span className="text-[10px] font-medium">Menu</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">📋</span>
          <span className="text-[10px] font-medium">Pesanan</span>
        </Link>
        <Link href="/rewards" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">🎁</span>
          <span className="text-[10px] font-medium">Reward</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-muted-foreground">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>
    </main>
  );
}

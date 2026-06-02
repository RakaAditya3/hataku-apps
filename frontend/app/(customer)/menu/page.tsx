import { getCategories, getProducts } from "@/lib/api/catalog";
import { CartIcon } from "@/components/customer/CartIcon";
import { MenuClient } from "./MenuClient";

export default async function MenuPage() {
  const [categoriesRes, productsRes] = await Promise.allSettled([
    getCategories(),
    getProducts(),
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
    <main className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 bg-cream px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-xl text-primary-dark">Menu</h1>
        <CartIcon />
      </header>

      <MenuClient categories={categories} products={products} />
    </main>
  );
}

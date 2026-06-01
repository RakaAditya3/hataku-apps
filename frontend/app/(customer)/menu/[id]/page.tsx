import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/catalog";
import { ProductDetail } from "@/components/customer/ProductDetail";
import { CartIcon } from "@/components/customer/CartIcon";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) notFound();

  let product;
  try {
    const res = await getProduct(numId);
    if (!res.success) notFound();
    product = res.data;
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <Link
          href="/menu"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-medium"
        >
          ← Menu
        </Link>
        <CartIcon />
      </header>

      <ProductDetail product={product} />
    </main>
  );
}

import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/catalog";
import { ProductDetail } from "@/components/customer/ProductDetail";

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
    <main className="min-h-screen bg-cream">
      <ProductDetail product={product} />
    </main>
  );
}

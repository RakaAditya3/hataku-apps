import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils/format";
import type { Product } from "@/types/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/menu/${product.id}`} className="block group">
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-muted">
          {product.photo_url ? (
            <Image
              src={product.photo_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-4xl">
              🥟
            </div>
          )}
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm font-semibold">
                Habis
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="font-semibold text-sm leading-tight line-clamp-2">
            {product.name}
          </p>
          <p className="text-orange-600 font-bold text-sm">
            {formatRupiah(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

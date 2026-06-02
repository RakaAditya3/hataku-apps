import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils/format";
import type { Product } from "@/types/api";

interface ProductCardProps {
  product: Product;
  variant?: "list" | "featured";
}

export function ProductCard({ product, variant = "list" }: ProductCardProps) {
  if (variant === "featured") {
    return (
      <Link
        href={`/menu/${product.id}`}
        className="block shrink-0 w-36 active:scale-[0.98] transition-transform"
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="relative h-28">
            {product.photo_url ? (
              <Image
                src={product.photo_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="144px"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-[#C4956A] to-primary-dark" />
            )}
            {!product.is_available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">Habis</span>
              </div>
            )}
          </div>
          <div className="px-2 pt-2 pb-2">
            <p className="font-semibold text-sm text-body-text leading-tight line-clamp-2">
              {product.name}
            </p>
            <p className="font-bold text-sm text-price mt-0.5">
              {formatRupiah(product.price)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/menu/${product.id}`}
      className="block active:scale-[0.99] transition-transform"
    >
      <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
        <div className="relative w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden">
          {product.photo_url ? (
            <Image
              src={product.photo_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-[#C4956A] to-primary-dark" />
          )}
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Habis</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-body-text leading-tight">
            {product.name}
          </p>
          {product.description && (
            <p className="text-xs text-subtext mt-0.5 line-clamp-1">
              {product.description}
            </p>
          )}
          <p className="font-bold text-sm text-price mt-1">
            {formatRupiah(product.price)}
          </p>
        </div>

        <div className="w-8 h-8 bg-[#C4956A] rounded-full flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white text-xl leading-none font-light">+</span>
        </div>
      </div>
    </Link>
  );
}

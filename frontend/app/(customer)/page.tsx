import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getProducts } from "@/lib/api/catalog";
import { getMe } from "@/lib/api/auth";
import { getPromos } from "@/lib/api/promos";
import { ProductCard } from "@/components/customer/ProductCard";
import { CartIcon } from "@/components/customer/CartIcon";
import { SplashRedirect } from "@/components/customer/SplashRedirect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [productsRes, userRes, promosRes] = await Promise.allSettled([
    getProducts(),
    session?.user.sanctumToken
      ? getMe(session.user.sanctumToken)
      : Promise.reject(null),
    getPromos(),
  ]);

  const products =
    productsRes.status === "fulfilled" && productsRes.value.success
      ? productsRes.value.data.slice(0, 6)
      : [];

  const user =
    userRes.status === "fulfilled" && userRes.value.success
      ? userRes.value.data
      : null;

  const promos =
    promosRes.status === "fulfilled" && promosRes.value.success
      ? promosRes.value.data
      : [];

  return (
    <main className="min-h-screen">
      <SplashRedirect />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream border-b border-hairline px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-[#C4956A] tracking-tight">
            HATAKU
          </span>
        </div>
        <div className="flex items-center gap-3">
          <CartIcon />
          {session?.user ? (
            <>
              {user && (
                <Badge
                  variant="secondary"
                  className="font-semibold text-primary-dark bg-[#C4956A]/10"
                >
                  {user.point_balance} poin
                </Badge>
              )}
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full bg-[#C4956A]/10 flex items-center justify-center text-primary-dark font-bold text-sm">
                  {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Promo banners */}
      <section className="px-4 pt-4">
        {promos.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="min-w-[85vw] md:min-w-[360px] snap-start shrink-0"
              >
                {promo.banner_url ? (
                  <div className="rounded-2xl overflow-hidden relative w-full h-[120px]">
                    <Image
                      src={promo.banner_url}
                      alt={promo.title}
                      fill
                      className="object-cover"
                    />
                    {promo.code && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-white/90 text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full">
                          Kode: {promo.code}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-linear-to-r from-[#C4956A] to-primary-dark p-5 text-white min-h-[120px] flex flex-col justify-between">
                    <p className="text-xs font-medium opacity-80 uppercase tracking-wide">
                      Promo
                    </p>
                    <div>
                      <p className="text-base font-black leading-tight">{promo.title}</p>
                      {promo.description && (
                        <p className="text-xs mt-1 opacity-80">{promo.description}</p>
                      )}
                      {promo.code && (
                        <span className="inline-block mt-2 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Kode: {promo.code}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-linear-to-r from-[#C4956A] to-primary-dark p-5 text-white min-h-[120px] flex flex-col justify-between">
            <p className="text-xs font-medium opacity-80 uppercase tracking-wide">
              Selamat datang
            </p>
            <div>
              <p className="text-xl font-black leading-tight">
                Pesan, Kumpulkan,
                <br />
                Nikmati.
              </p>
              <p className="text-xs mt-1 opacity-80">
                Poin loyalty untuk setiap transaksi
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Featured products */}
      <section className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-primary-dark">Menu Pilihan</h2>
          <Link
            href="/menu"
            className="text-sm text-[#C4956A] font-medium"
          >
            Lihat semua
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-subtext text-sm">
            Menu belum tersedia
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

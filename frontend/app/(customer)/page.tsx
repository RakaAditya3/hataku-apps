import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getProducts } from "@/lib/api/catalog";
import { getMe } from "@/lib/api/auth";
import { ProductCard } from "@/components/customer/ProductCard";
import { CartIcon } from "@/components/customer/CartIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils/format";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [productsRes, userRes] = await Promise.allSettled([
    getProducts(),
    session?.user.sanctumToken
      ? getMe(session.user.sanctumToken)
      : Promise.reject(null),
  ]);

  const products =
    productsRes.status === "fulfilled" && productsRes.value.success
      ? productsRes.value.data.slice(0, 6)
      : [];

  const user =
    userRes.status === "fulfilled" && userRes.value.success
      ? userRes.value.data
      : null;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-orange-600 tracking-tight">
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
                  className="font-semibold text-orange-700 bg-orange-50"
                >
                  {user.point_balance} poin
                </Badge>
              )}
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
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

      {/* Banner promo placeholder */}
      <section className="px-4 pt-4">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-5 text-white min-h-[120px] flex flex-col justify-between">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wide">
            Promo
          </p>
          <div>
            <p className="text-xl font-black leading-tight">
              Pesan, Kumpulkan,
              <br />
              Nikmati. 🥟
            </p>
            <p className="text-xs mt-1 opacity-80">
              Poin loyalty untuk setiap transaksi
            </p>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Menu Pilihan</h2>
          <Link
            href="/menu"
            className="text-sm text-orange-600 font-medium hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
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

      {/* Bottom nav placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-2 flex justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-orange-600">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center gap-0.5 text-muted-foreground">
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

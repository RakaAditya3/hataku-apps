import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getProducts } from "@/lib/api/catalog";
import { getMe } from "@/lib/api/auth";
import { getPromos } from "@/lib/api/promos";
import { getCheckinStatus } from "@/lib/api/loyalty";
import { ProductCard } from "@/components/customer/ProductCard";
import { HeroBanner } from "@/components/customer/HeroBanner";
import { SplashRedirect } from "@/components/customer/SplashRedirect";

const TIER_LABEL: Record<string, string> = {
  bamboo: "Bamboo",
  jade: "Jade",
  imperial: "Imperial",
  dragon: "Dragon",
};

const TIER_BADGE_CLASS: Record<string, string> = {
  bamboo: "bg-green-50 text-green-600",
  jade: "bg-emerald-50 text-emerald-600",
  imperial: "bg-purple-50 text-purple-600",
  dragon: "bg-orange-50 text-orange-600",
};

function getTierProgress(tier: string, count: number) {
  if (tier === "bamboo") {
    return { nextTier: "Jade", remaining: Math.max(0, 5 - count), progress: Math.min(1, count / 5) };
  }
  if (tier === "jade") {
    return { nextTier: "Imperial", remaining: Math.max(0, 25 - count), progress: Math.min(1, (count - 5) / 20) };
  }
  if (tier === "imperial") {
    return { nextTier: "Dragon", remaining: Math.max(0, 50 - count), progress: Math.min(1, (count - 25) / 25) };
  }
  return null;
}

const QUICK_ACTIONS = [
  { emoji: "🍱", label: "Pesan", authHref: "/menu", guestHref: "/menu" },
  { emoji: "🎁", label: "Rewards", authHref: "/rewards", guestHref: "/login" },
  { emoji: "📋", label: "Pesanan", authHref: "/orders", guestHref: "/login" },
  { emoji: "🏷️", label: "Promo", authHref: "/menu", guestHref: "/menu" },
] as const;

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [productsRes, userRes, promosRes, checkinRes] = await Promise.allSettled([
    getProducts(),
    session?.user.sanctumToken
      ? getMe(session.user.sanctumToken)
      : Promise.reject(null),
    getPromos(),
    session?.user.sanctumToken
      ? getCheckinStatus(session.user.sanctumToken)
      : Promise.reject(null),
  ]);

  const products =
    productsRes.status === "fulfilled" && productsRes.value.success
      ? productsRes.value.data.slice(0, 8)
      : [];

  const user =
    userRes.status === "fulfilled" && userRes.value.success
      ? userRes.value.data
      : null;

  const promos =
    promosRes.status === "fulfilled" && promosRes.value.success
      ? promosRes.value.data
      : [];

  const checkinStatus =
    checkinRes.status === "fulfilled" && checkinRes.value.success
      ? checkinRes.value.data
      : null;

  const tierProgress = user ? getTierProgress(user.tier, user.valid_transaction_count) : null;

  return (
    <main className="min-h-screen">
      <SplashRedirect />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-cream px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥟</span>
          <span className="font-black text-primary-dark text-lg tracking-tight">HATAKU</span>
        </div>
        {session?.user ? (
          <Link href="/profile">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Avatar"}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark font-bold text-sm">
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-semibold"
          >
            Masuk
          </Link>
        )}
      </header>

      {/* Hero banner */}
      <HeroBanner promos={promos} />

      {/* Loyalty card — logged in only */}
      {user && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🪙</span>
                <span className="font-bold text-lg text-body-text">
                  {user.point_balance.toLocaleString("id-ID")} Poin
                </span>
              </div>
              <span
                className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE_CLASS[user.tier]}`}
              >
                {TIER_LABEL[user.tier]}
              </span>
            </div>
            {tierProgress ? (
              <div className="text-right">
                <p className="text-xs text-subtext leading-tight">
                  Menuju {tierProgress.nextTier}
                </p>
                <p className="text-xs font-semibold text-primary-dark mt-0.5">
                  {tierProgress.remaining} transaksi lagi
                </p>
              </div>
            ) : (
              <span className="text-xs font-semibold text-primary">Tier Tertinggi 🏆</span>
            )}
          </div>
          {tierProgress && (
            <div className="mt-3 h-1.5 bg-hairline rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${tierProgress.progress * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Streak mini — logged in only */}
      {user && checkinStatus && (
        <Link href="/profile" className="block mx-4 mt-3">
          <div className="bg-linear-to-r from-primary to-primary-dark rounded-2xl p-4 flex items-center justify-between active:opacity-90 transition-opacity">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <span className="text-white font-bold text-base">
                  {checkinStatus.current_streak} Hari Streak
                </span>
              </div>
              <p className="text-white/80 text-sm mt-0.5">
                {checkinStatus.already_checked_in
                  ? "Sudah check-in ✓"
                  : "Check-in hari ini!"}
              </p>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < checkinStatus.current_streak ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </Link>
      )}

      {/* Quick actions 2x2 */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map(({ emoji, label, authHref, guestHref }) => (
          <Link key={label} href={session ? authHref : guestHref}>
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:scale-[0.98] transition-transform">
              <span className="text-3xl">{emoji}</span>
              <span className="font-semibold text-sm text-primary-dark">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured menu horizontal scroll */}
      {products.length > 0 && (
        <section className="mx-4 mt-6 mb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-primary-dark text-base">Menu Pilihan 🔥</h2>
            <Link href="/menu" className="text-sm text-primary font-medium">
              Lihat Semua →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant="featured" />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

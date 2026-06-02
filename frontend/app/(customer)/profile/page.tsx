"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMe, type UserData } from "@/lib/api/auth";

const TIER_COLORS: Record<string, string> = {
  bamboo: "bg-green-100 text-green-700",
  jade: "bg-emerald-100 text-emerald-800",
  imperial: "bg-purple-100 text-purple-800",
  dragon: "bg-red-100 text-red-800",
};

const TIER_LABELS: Record<string, string> = {
  bamboo: "Bamboo",
  jade: "Jade",
  imperial: "Imperial",
  dragon: "Dragon",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.sanctumToken) return;
    getMe(session.user.sanctumToken)
      .then((res) => {
        if (res.success) setUser(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [status, session]);

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <h1 className="text-base font-bold">Profil</h1>
        </header>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Memuat...
        </div>
      </main>
    );
  }

  if (!user) return null;

  const tier = user.tier;

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="text-base font-bold">Profil</h1>
      </header>

      <div className="px-4 pt-6 space-y-4">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-base">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && (
              <p className="text-xs text-muted-foreground">{user.phone}</p>
            )}
          </div>
        </div>

        {/* Tier Card */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${TIER_COLORS[tier]} text-sm px-3 py-1`}>
              {TIER_LABELS[tier]}
            </Badge>
            <span className="text-xl font-black text-orange-600">
              {user.point_balance} pt
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-orange-600">{user.point_balance}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Point Tersedia</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-black">{user.valid_transaction_count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Transaksi Valid</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-2xl border bg-card divide-y">
          <Link href="/rewards" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎁</span>
              <span className="text-sm font-medium">Reward & Loyalty</span>
            </div>
            <span className="text-muted-foreground text-sm">→</span>
          </Link>
          <Link href="/rewards/history" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="text-sm font-medium">Riwayat Point</span>
            </div>
            <span className="text-muted-foreground text-sm">→</span>
          </Link>
          <Link href="/orders" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span className="text-sm font-medium">Riwayat Pesanan</span>
            </div>
            <span className="text-muted-foreground text-sm">→</span>
          </Link>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          Keluar
        </Button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-2 flex justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-muted-foreground">
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
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-orange-600">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>
    </main>
  );
}

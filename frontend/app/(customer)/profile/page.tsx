"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getMe, type UserData } from "@/lib/api/auth";
import {
  checkin,
  getCheckinStatus,
  type CheckinStatus,
} from "@/lib/api/loyalty";

const TIER_COLORS: Record<string, string> = {
  bamboo:   "bg-green-100 text-green-700",
  jade:     "bg-emerald-100 text-emerald-700",
  imperial: "bg-purple-100 text-purple-700",
  dragon:   "bg-red-100 text-red-700",
};

const TIER_LABELS: Record<string, string> = {
  bamboo:   "Bamboo",
  jade:     "Jade",
  imperial: "Imperial",
  dragon:   "Dragon",
};

const MENU_ITEMS = [
  { icon: "🎁", label: "Rewards & Poin",    href: "/rewards" },
  { icon: "📋", label: "Riwayat Pesanan",   href: "/orders" },
  { icon: "🏷️", label: "Riwayat Poin",      href: "/rewards/history" },
  { icon: "👤", label: "Edit Profil",        href: "/profile/edit" },
];

function StreakBoxes({
  currentStreak,
  alreadyCheckedIn,
}: {
  currentStreak: number;
  alreadyCheckedIn: boolean;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 7 }, (_, i) => {
        const day = i + 1;
        const isDone = day < currentStreak || (day === currentStreak && alreadyCheckedIn);
        const isToday = day === currentStreak && !alreadyCheckedIn;

        let cls = "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ";
        if (isDone) cls += "bg-primary text-white";
        else if (isToday) cls += "ring-1 ring-primary text-primary animate-pulse bg-primary/10";
        else cls += "bg-hairline text-subtext";

        return (
          <div key={day} className={cls}>
            {isDone ? "✓" : day}
          </div>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.sanctumToken) return;
    const token = session.user.sanctumToken;

    Promise.allSettled([getMe(token), getCheckinStatus(token)]).then(
      ([userRes, statusRes]) => {
        if (userRes.status === "fulfilled" && userRes.value.success)
          setUser(userRes.value.data);
        if (statusRes.status === "fulfilled" && statusRes.value.success)
          setCheckinStatus(statusRes.value.data);
        setIsLoading(false);
      }
    );
  }, [status, session]);

  async function handleCheckin() {
    if (!session?.user.sanctumToken) return;
    setIsCheckinLoading(true);
    try {
      const res = await checkin(session.user.sanctumToken);
      if (res.success) {
        toast.success(
          res.data.is_bonus_day
            ? `Check-in hari ke-7! Bonus ${res.data.points_earned} poin!`
            : `Check-in berhasil! +${res.data.points_earned} poin`
        );
        const [updatedUser, updatedStatus] = await Promise.all([
          getMe(session.user.sanctumToken),
          getCheckinStatus(session.user.sanctumToken),
        ]);
        if (updatedUser.success) setUser(updatedUser.data);
        if (updatedStatus.success) setCheckinStatus(updatedStatus.data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal check-in");
    } finally {
      setIsCheckinLoading(false);
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="flex items-center justify-center py-20 text-subtext text-sm">
          Memuat...
        </div>
      </main>
    );
  }

  if (!user) return null;

  const tier = user.tier;
  const pointBalance = user.point_balance;
  const currentStreak = checkinStatus?.current_streak ?? user.current_streak ?? 0;
  const alreadyCheckedIn = checkinStatus?.already_checked_in ?? false;

  return (
    <main className="min-h-screen bg-cream pb-8">
      {/* Profile Header */}
      <div className="bg-cream px-4 pt-6 pb-4 relative">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name}
              width={72}
              height={72}
              className="rounded-full border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xl text-primary-dark truncate">{user.name}</p>
            <p className="text-sm text-subtext truncate">{user.email}</p>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${TIER_COLORS[tier]}`}>
              {TIER_LABELS[tier]}
            </span>
          </div>
        </div>

        {/* Decorative dimsum */}
        <span className="absolute right-4 bottom-4 text-5xl opacity-20 select-none">🥟</span>
      </div>

      <div className="space-y-3 px-4">
        {/* Stats Row */}
        <div className="bg-white rounded-2xl p-4 grid grid-cols-3 divide-x divide-hairline">
          <div className="flex flex-col items-center gap-0.5 pr-2">
            <span className="text-base">🏷️</span>
            <span className="font-bold text-xl text-primary-dark">0</span>
            <span className="text-xs text-subtext">Voucher</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-2">
            <span className="text-base">🪙</span>
            <span className="font-bold text-xl text-primary">{pointBalance}</span>
            <span className="text-xs text-subtext">Poin</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 pl-2">
            <span className="text-base">🔥</span>
            <span className="font-bold text-xl text-primary-dark">{currentStreak}</span>
            <span className="text-xs text-subtext">Hari Streak</span>
          </div>
        </div>

        {/* Streak Widget (Duolingo style) */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg text-primary">
                🔥 {currentStreak} Hari
              </p>
              <p className="text-xs text-subtext">Check-in harian</p>
            </div>
            <StreakBoxes currentStreak={currentStreak} alreadyCheckedIn={alreadyCheckedIn} />
          </div>

          {alreadyCheckedIn ? (
            <button
              disabled
              className="w-full h-10 mt-3 bg-hairline text-subtext rounded-xl font-semibold text-sm"
            >
              Sudah Check-in ✓
            </button>
          ) : (
            <button
              onClick={handleCheckin}
              disabled={isCheckinLoading}
              className="w-full h-10 mt-3 bg-primary/10 text-primary rounded-xl font-semibold text-sm disabled:opacity-60"
            >
              {isCheckinLoading ? "Memproses..." : "Check-in Sekarang"}
            </button>
          )}
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {MENU_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-4 hover:bg-gray-50 transition-colors ${
                index < MENU_ITEMS.length - 1 ? "border-b border-hairline" : ""
              }`}
            >
              <span className="text-xl w-8">{item.icon}</span>
              <span className="flex-1 text-sm text-body-text font-medium">{item.label}</span>
              <span className="text-subtext text-sm">›</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-12 border-2 border-price text-price rounded-2xl font-semibold flex items-center justify-center gap-2 bg-transparent"
        >
          <span>🚪</span>
          Keluar
        </button>
      </div>
    </main>
  );
}

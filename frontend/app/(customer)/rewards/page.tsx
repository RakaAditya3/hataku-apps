"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils/format";
import {
  checkin,
  getCheckinStatus,
  getRewards,
  type CheckinStatus,
  type Reward,
} from "@/lib/api/loyalty";
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

const TIER_THRESHOLDS: Array<{ tier: string; min: number; max: number | null }> = [
  { tier: "bamboo", min: 0, max: 4 },
  { tier: "jade", min: 5, max: 24 },
  { tier: "imperial", min: 25, max: 49 },
  { tier: "dragon", min: 50, max: null },
];

function getNextTierInfo(currentTier: string, validCount: number) {
  const tiers = ["bamboo", "jade", "imperial", "dragon"];
  const idx = tiers.indexOf(currentTier);
  if (idx === tiers.length - 1) return null;
  const nextTier = tiers[idx + 1];
  const nextThreshold = TIER_THRESHOLDS[idx + 1];
  const remaining = nextThreshold.min - validCount;
  return { nextTier, remaining };
}

function StreakDots({ currentStreak, alreadyCheckedIn }: { currentStreak: number; alreadyCheckedIn: boolean }) {
  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 justify-center mt-3">
      {days.map((day) => {
        const isDone = day < currentStreak || (day === currentStreak && alreadyCheckedIn);
        const isToday = day === currentStreak && !alreadyCheckedIn;
        const isBonus = day === 7;

        let className = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ";

        if (isBonus && isDone) {
          className += "bg-yellow-400 border-yellow-500 text-white";
        } else if (isDone) {
          className += "bg-green-500 border-green-600 text-white";
        } else if (isToday) {
          className += "bg-orange-100 border-orange-400 text-orange-600 animate-pulse";
        } else {
          className += "bg-gray-100 border-gray-200 text-gray-400";
        }

        return (
          <div key={day} className={className}>
            {isBonus ? "★" : day}
          </div>
        );
      })}
    </div>
  );
}

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.sanctumToken) return;

    const token = session.user.sanctumToken;
    setIsLoading(true);

    Promise.allSettled([
      getCheckinStatus(token),
      getRewards(),
      getMe(token),
    ]).then(([statusRes, rewardsRes, userRes]) => {
      if (statusRes.status === "fulfilled" && statusRes.value.success) {
        setCheckinStatus(statusRes.value.data);
      }
      if (rewardsRes.status === "fulfilled" && rewardsRes.value.success) {
        setRewards(rewardsRes.value.data);
      }
      if (userRes.status === "fulfilled" && userRes.value.success) {
        setUserData(userRes.value.data);
      }
      setIsLoading(false);
    });
  }, [status, session]);

  async function handleCheckin() {
    if (!session?.user.sanctumToken) return;
    setIsCheckinLoading(true);
    try {
      const res = await checkin(session.user.sanctumToken);
      if (res.success) {
        toast.success(
          res.data.is_bonus_day
            ? `Check-in hari ke-7! Bonus ${res.data.points_earned} point!`
            : `Check-in berhasil! +${res.data.points_earned} point`
        );
        // Refresh checkin status
        const updated = await getCheckinStatus(session.user.sanctumToken);
        if (updated.success) setCheckinStatus(updated.data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal check-in");
    } finally {
      setIsCheckinLoading(false);
    }
  }

  const tier = userData?.tier ?? "bamboo";
  const pointBalance = checkinStatus?.point_balance ?? userData?.point_balance ?? 0;
  const validCount = userData?.valid_transaction_count ?? 0;
  const nextTierInfo = getNextTierInfo(tier, validCount);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <h1 className="text-base font-bold">Reward & Loyalty</h1>
        </header>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Memuat...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="text-base font-bold">Reward & Loyalty</h1>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Daily Check-in Card */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold">Check-in Harian</h2>
            <span className="text-xs text-muted-foreground">
              Hari ke-{checkinStatus?.already_checked_in ? checkinStatus.current_streak : checkinStatus?.next_streak_day ?? 1}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {checkinStatus?.already_checked_in
              ? "Sudah check-in hari ini"
              : `Check-in sekarang, dapat ${checkinStatus?.next_points_if_checkin ?? 1} point${checkinStatus?.next_streak_day === 7 ? " (BONUS HARI ke-7!)" : ""}`}
          </p>
          <StreakDots
            currentStreak={checkinStatus?.current_streak ?? 0}
            alreadyCheckedIn={checkinStatus?.already_checked_in ?? false}
          />
          <div className="mt-4">
            {checkinStatus?.already_checked_in ? (
              <Button variant="outline" className="w-full" disabled>
                Sudah Check-in Hari Ini ✓
              </Button>
            ) : (
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleCheckin}
                disabled={isCheckinLoading}
              >
                {isCheckinLoading ? "Memproses..." : "Check-in Sekarang"}
              </Button>
            )}
          </div>
        </div>

        {/* Point Balance & Tier */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Point & Tier</h2>
            <Link href="/rewards/history" className="text-xs text-orange-600 hover:underline">
              Riwayat Point →
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-orange-600">{pointBalance}</div>
            <div>
              <div className="text-xs text-muted-foreground">Point tersedia</div>
              <Badge className={`text-xs mt-0.5 ${TIER_COLORS[tier]}`}>
                {TIER_LABELS[tier]}
              </Badge>
            </div>
          </div>
          {nextTierInfo && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Menuju {TIER_LABELS[nextTierInfo.nextTier]}</span>
                <span>{nextTierInfo.remaining} transaksi lagi</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-orange-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (validCount / TIER_THRESHOLDS.find(t => t.tier === nextTierInfo.nextTier)!.min) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {validCount} transaksi valid tercatat
              </p>
            </div>
          )}
          {!nextTierInfo && (
            <p className="text-xs text-muted-foreground mt-2">
              Selamat! Kamu sudah di tier tertinggi 🐉
            </p>
          )}
        </div>

        {/* Rewards Catalog */}
        <div>
          <h2 className="text-sm font-bold mb-3">Katalog Reward</h2>
          {rewards.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Belum ada reward tersedia
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => {
                const canRedeem = pointBalance >= reward.points_required;
                return (
                  <div
                    key={reward.id}
                    className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${
                      !canRedeem ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{reward.name}</p>
                      {reward.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                      )}
                      {reward.type === "discount" && reward.discount_value && (
                        <p className="text-xs text-green-700 font-medium mt-0.5">
                          Diskon {formatRupiah(reward.discount_value)}
                        </p>
                      )}
                      {reward.type === "product" && reward.product && (
                        <p className="text-xs text-green-700 font-medium mt-0.5">
                          Gratis {reward.product.name}
                        </p>
                      )}
                      <p className="text-xs text-orange-600 font-bold mt-1">
                        {reward.points_required} point
                      </p>
                    </div>
                    <Link href={`/checkout?reward_id=${reward.id}`}>
                      <Button
                        size="sm"
                        variant={canRedeem ? "default" : "outline"}
                        className={canRedeem ? "bg-orange-600 hover:bg-orange-700 shrink-0" : "shrink-0"}
                        disabled={!canRedeem}
                      >
                        Tukar
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
        <Link href="/rewards" className="flex flex-col items-center gap-0.5 text-orange-600">
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

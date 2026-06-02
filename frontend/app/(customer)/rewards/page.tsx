"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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

const TIER_THRESHOLDS = [
  { tier: "bamboo",   min: 0,  max: 4  },
  { tier: "jade",     min: 5,  max: 24 },
  { tier: "imperial", min: 25, max: 49 },
  { tier: "dragon",   min: 50, max: null },
];

function getNextTierInfo(currentTier: string, validCount: number) {
  const tiers = ["bamboo", "jade", "imperial", "dragon"];
  const idx = tiers.indexOf(currentTier);
  if (idx === tiers.length - 1) return null;
  const nextTier = tiers[idx + 1];
  const nextThreshold = TIER_THRESHOLDS[idx + 1];
  return { nextTier, remaining: nextThreshold.min - validCount, min: nextThreshold.min };
}

function StreakDots({
  currentStreak,
  alreadyCheckedIn,
}: {
  currentStreak: number;
  alreadyCheckedIn: boolean;
}) {
  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  return (
    <div className="flex items-end gap-1.5 mt-3">
      {days.map((day) => {
        const isDone = day < currentStreak || (day === currentStreak && alreadyCheckedIn);
        const isToday = day === currentStreak && !alreadyCheckedIn;
        const isBonus = day === 7;

        let dotClass =
          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ";

        if (isBonus && isDone) {
          dotClass += "bg-amber-400 text-white";
        } else if (isDone) {
          dotClass += "bg-primary text-white";
        } else if (isToday) {
          dotClass += "ring-2 ring-primary text-primary animate-pulse bg-primary/10";
        } else {
          dotClass += "bg-hairline text-subtext";
        }

        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <div className={dotClass}>
              {isDone ? (isBonus ? "⭐" : "✓") : day}
            </div>
            <span className="text-[10px] text-subtext">H{day}</span>
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
    if (status === "unauthenticated") router.replace("/login");
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
      if (statusRes.status === "fulfilled" && statusRes.value.success)
        setCheckinStatus(statusRes.value.data);
      if (rewardsRes.status === "fulfilled" && rewardsRes.value.success)
        setRewards(rewardsRes.value.data);
      if (userRes.status === "fulfilled" && userRes.value.success)
        setUserData(userRes.value.data);
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
            ? `Check-in hari ke-7! Bonus ${res.data.points_earned} poin!`
            : `Check-in berhasil! +${res.data.points_earned} poin`
        );
        const [updatedStatus, updatedUser] = await Promise.all([
          getCheckinStatus(session.user.sanctumToken),
          getMe(session.user.sanctumToken),
        ]);
        if (updatedStatus.success) setCheckinStatus(updatedStatus.data);
        if (updatedUser.success) setUserData(updatedUser.data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal check-in");
    } finally {
      setIsCheckinLoading(false);
    }
  }

  const tier = userData?.tier ?? "bamboo";
  const pointBalance = checkinStatus?.point_balance ?? userData?.point_balance ?? 0;
  const currentStreak = checkinStatus?.current_streak ?? userData?.current_streak ?? 0;
  const alreadyCheckedIn = checkinStatus?.already_checked_in ?? false;
  const validCount = userData?.valid_transaction_count ?? 0;
  const nextTierInfo = getNextTierInfo(tier, validCount);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="flex items-center justify-center py-20 text-subtext text-sm">
          Memuat...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-8">
      {/* Gradient Header */}
      <div className="bg-linear-to-b from-primary to-primary-dark px-4 pt-6 pb-16">
        <div className="flex items-center justify-between">
          <p className="font-bold text-xl text-white">HATAKU Points</p>
          <Link href="/rewards/history" className="text-sm text-white/80 hover:text-white">
            History →
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl">🪙</span>
          <span className="font-bold text-4xl text-white">{pointBalance} pts</span>
        </div>
      </div>

      <div className="space-y-4 pb-2">
        {/* Streak Card — overlap ke atas */}
        <section className="mx-4 -mt-8 relative z-10 bg-white rounded-2xl p-4 shadow-md">
          <p className="font-semibold text-base text-primary-dark">Check-in Harian</p>
          <StreakDots currentStreak={currentStreak} alreadyCheckedIn={alreadyCheckedIn} />
          <p className="text-sm text-primary mt-3">
            🔥 {currentStreak} hari berturut-turut
          </p>
          {alreadyCheckedIn ? (
            <button
              disabled
              className="w-full h-11 mt-3 bg-hairline text-subtext rounded-full font-semibold text-sm"
            >
              Sudah Check-in ✓
            </button>
          ) : (
            <button
              onClick={handleCheckin}
              disabled={isCheckinLoading}
              className="w-full h-11 mt-3 bg-primary text-white rounded-full font-semibold text-sm disabled:opacity-60"
            >
              {isCheckinLoading ? "Memproses..." : "Check-in Sekarang"}
            </button>
          )}
        </section>

        {/* Tier Info */}
        <section className="mx-4 bg-white rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${TIER_COLORS[tier]}`}
            >
              {TIER_LABELS[tier]}
            </span>
            {nextTierInfo ? (
              <p className="text-xs text-subtext">
                {nextTierInfo.remaining} transaksi lagi ke {TIER_LABELS[nextTierInfo.nextTier]}
              </p>
            ) : (
              <p className="text-xs text-subtext">Tier tertinggi 🐉</p>
            )}
          </div>
          {nextTierInfo && (
            <div className="mt-3">
              <div className="w-full bg-hairline rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (validCount / nextTierInfo.min) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-subtext mt-1">
                {validCount} / {nextTierInfo.min} transaksi valid
              </p>
            </div>
          )}
        </section>

        {/* Tukarkan Poin */}
        <section className="mx-4">
          <p className="font-bold text-base text-primary-dark mb-3">Tukarkan Poin</p>
          {rewards.length === 0 ? (
            <div className="text-center py-10 text-subtext text-sm">
              Belum ada reward tersedia
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => {
                const canRedeem = pointBalance >= reward.points_required;
                const valueLabel =
                  reward.type === "discount" && reward.discount_value
                    ? `${Math.round(reward.discount_value / 1000)}rb`
                    : reward.product?.name ?? "—";
                const typeLabel =
                  reward.type === "discount" ? "Diskon" : "Produk";

                return (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-2xl overflow-hidden flex ${
                      !canRedeem ? "opacity-60" : ""
                    }`}
                  >
                    {/* Left panel */}
                    <div className="bg-primary/10 p-4 w-24 shrink-0 flex flex-col items-center justify-center">
                      <p className="text-xs text-subtext">{typeLabel}</p>
                      <p className="font-bold text-2xl text-primary leading-tight">{valueLabel}</p>
                    </div>

                    {/* Right panel */}
                    <div className="flex-1 p-4 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-body-text leading-snug">
                          {reward.name}
                        </p>
                        <p className="text-sm text-subtext mt-0.5">
                          {reward.points_required} poin
                        </p>
                      </div>
                      <Link href={`/checkout?reward_id=${reward.id}`}>
                        <button
                          disabled={!canRedeem}
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 ${
                            canRedeem
                              ? "bg-primary text-white"
                              : "bg-hairline text-subtext cursor-not-allowed"
                          }`}
                        >
                          Tukar
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils/format";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { getAdminRewards, deleteAdminReward, type Reward } from "@/lib/api/loyalty";
import { RewardFormDialog } from "@/components/admin/RewardFormDialog";

export default function AdminRewardsPage() {
  const { token } = useAdminAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editReward, setEditReward] = useState<Reward | null>(null);

  async function loadRewards() {
    if (!token) return;
    try {
      const res = await getAdminRewards(token);
      if (res.success) setRewards(res.data);
    } catch {
      toast.error("Gagal memuat rewards");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, [token]);

  async function handleDeactivate(id: number) {
    if (!token) return;
    try {
      await deleteAdminReward(id, token);
      toast.success("Reward dinonaktifkan");
      loadRewards();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menonaktifkan reward");
    }
  }

  function openCreate() {
    setEditReward(null);
    setDialogOpen(true);
  }

  function openEdit(reward: Reward) {
    setEditReward(reward);
    setDialogOpen(true);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Rewards</h1>
          <p className="text-sm text-muted-foreground">Kelola katalog reward loyalty</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
          + Tambah Reward
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Memuat...</div>
      ) : rewards.length === 0 ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Belum ada reward</div>
      ) : (
        <div className="space-y-3">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`rounded-xl border bg-white p-4 flex items-center gap-3 ${!reward.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{reward.name}</p>
                  <Badge variant={reward.type === "discount" ? "secondary" : "outline"} className="text-xs">
                    {reward.type === "discount" ? "Diskon" : "Produk"}
                  </Badge>
                  {!reward.is_active && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Nonaktif
                    </Badge>
                  )}
                </div>
                {reward.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{reward.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-orange-600">
                    {reward.points_required} point
                  </span>
                  {reward.type === "discount" && reward.discount_value && (
                    <span className="text-xs text-green-700">
                      Diskon {formatRupiah(reward.discount_value)}
                    </span>
                  )}
                  {reward.type === "product" && reward.product && (
                    <span className="text-xs text-green-700">
                      Gratis {reward.product.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(reward)}
                >
                  Edit
                </Button>
                {reward.is_active && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeactivate(reward.id)}
                  >
                    Nonaktifkan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <RewardFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reward={editReward}
        token={token ?? ""}
        onSuccess={() => {
          setDialogOpen(false);
          loadRewards();
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils/format";
import { useAdminAuth } from "@/lib/store/admin-auth";
import {
  getAdminPromos,
  deleteAdminPromo,
  updateAdminPromo,
  type AdminPromo,
} from "@/lib/api/promos";
import { PromoFormDialog } from "@/components/admin/PromoFormDialog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function isExpired(validUntil: string) {
  return new Date(validUntil) < new Date();
}

export default function AdminPromosPage() {
  const { token } = useAdminAuth();
  const [promos, setPromos] = useState<AdminPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPromo, setEditPromo] = useState<AdminPromo | null>(null);

  async function loadPromos() {
    if (!token) return;
    try {
      const res = await getAdminPromos(token);
      if (res.success) setPromos(res.data);
    } catch {
      toast.error("Gagal memuat promo");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPromos();
  }, [token]);

  async function handleToggleActive(promo: AdminPromo) {
    if (!token) return;
    try {
      await updateAdminPromo(promo.id, { is_active: !promo.is_active }, token);
      toast.success(promo.is_active ? "Promo dinonaktifkan" : "Promo diaktifkan");
      loadPromos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal update promo");
    }
  }

  async function handleDelete(promo: AdminPromo) {
    if (!token) return;
    if (!confirm(`Hapus promo "${promo.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await deleteAdminPromo(promo.id, token);
      toast.success("Promo berhasil dihapus");
      loadPromos();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus promo");
    }
  }

  function openCreate() {
    setEditPromo(null);
    setDialogOpen(true);
  }

  function openEdit(promo: AdminPromo) {
    setEditPromo(promo);
    setDialogOpen(true);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Promo</h1>
          <p className="text-sm text-muted-foreground">Kelola banner dan kode promo</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
          + Tambah Promo
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Memuat...</div>
      ) : promos.length === 0 ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Belum ada promo</div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const expired = isExpired(promo.valid_until);
            return (
              <div
                key={promo.id}
                className={`rounded-xl border bg-white p-4 ${!promo.is_active || expired ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold">{promo.title}</p>
                      {promo.is_active && !expired && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-0">Aktif</Badge>
                      )}
                      {!promo.is_active && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Nonaktif</Badge>
                      )}
                      {expired && (
                        <Badge variant="outline" className="text-xs text-red-500 border-red-200">Kadaluarsa</Badge>
                      )}
                    </div>

                    {promo.description && (
                      <p className="text-xs text-muted-foreground mb-1 truncate">{promo.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-semibold text-orange-600">
                        {promo.discount_type === "fixed"
                          ? `Diskon ${formatRupiah(promo.discount_value)}`
                          : `Diskon ${promo.discount_value}%`}
                      </span>
                      {promo.min_purchase > 0 && (
                        <span className="text-muted-foreground">Min. {formatRupiah(promo.min_purchase)}</span>
                      )}
                      {promo.code && (
                        <span className="bg-orange-50 text-orange-700 font-mono font-bold px-2 py-0.5 rounded">
                          {promo.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatDate(promo.valid_from)} – {formatDate(promo.valid_until)}</span>
                      {promo.max_uses !== null && (
                        <span>{promo.current_uses}/{promo.max_uses} digunakan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(promo)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={promo.is_active ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-green-200 text-green-700 hover:bg-green-50"}
                      onClick={() => handleToggleActive(promo)}
                    >
                      {promo.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(promo)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PromoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promo={editPromo}
        token={token ?? ""}
        onSuccess={() => {
          setDialogOpen(false);
          loadPromos();
        }}
      />
    </div>
  );
}

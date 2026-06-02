"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAdminReward, updateAdminReward, type Reward } from "@/lib/api/loyalty";
import { getAdminProducts } from "@/lib/api/admin-products";
import type { AdminProduct } from "@/types/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  token: string;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  description: string;
  type: "discount" | "product";
  points_required: string;
  discount_value: string;
  product_id: string;
};

function buildInitial(reward: Reward | null): FormState {
  if (!reward) {
    return {
      name: "",
      description: "",
      type: "discount",
      points_required: "",
      discount_value: "",
      product_id: "",
    };
  }
  return {
    name: reward.name,
    description: reward.description ?? "",
    type: reward.type,
    points_required: String(reward.points_required),
    discount_value: reward.discount_value ? String(reward.discount_value) : "",
    product_id: reward.product?.id ? String(reward.product.id) : "",
  };
}

export function RewardFormDialog({ open, onOpenChange, reward, token, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(buildInitial(reward));
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(buildInitial(reward));
  }, [reward, open]);

  useEffect(() => {
    if (!open || !token) return;
    getAdminProducts(token).then((res) => {
      if (res.success) setProducts(res.data);
    }).catch(() => {});
  }, [open, token]);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description || null,
        type: form.type,
        points_required: parseInt(form.points_required, 10),
      };

      if (form.type === "discount") {
        payload.discount_value = parseInt(form.discount_value, 10);
        payload.product_id = null;
      } else {
        payload.product_id = parseInt(form.product_id, 10);
        payload.discount_value = null;
      }

      if (reward) {
        await updateAdminReward(reward.id, payload as Partial<Reward>, token);
        toast.success("Reward berhasil diupdate");
      } else {
        await createAdminReward(payload as Partial<Reward>, token);
        toast.success("Reward berhasil dibuat");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan reward");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{reward ? "Edit Reward" : "Tambah Reward"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Reward</label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="cth. Voucher Diskon Rp5.000"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Deskripsi</label>
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Opsional"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipe Reward</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={form.type}
              onChange={(e) => set("type", e.target.value as "discount" | "product")}
            >
              <option value="discount">Diskon (potongan Rupiah)</option>
              <option value="product">Produk Gratis</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Points Diperlukan</label>
            <Input
              type="number"
              min={1}
              value={form.points_required}
              onChange={(e) => set("points_required", e.target.value)}
              placeholder="cth. 100"
              required
            />
          </div>

          {form.type === "discount" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nilai Diskon (Rupiah)</label>
              <Input
                type="number"
                min={1}
                value={form.discount_value}
                onChange={(e) => set("discount_value", e.target.value)}
                placeholder="cth. 5000"
                required
              />
            </div>
          )}

          {form.type === "product" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Produk Gratis</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.product_id}
                onChange={(e) => set("product_id", e.target.value)}
                required
              >
                <option value="">Pilih produk...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : reward ? "Simpan Perubahan" : "Tambah Reward"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

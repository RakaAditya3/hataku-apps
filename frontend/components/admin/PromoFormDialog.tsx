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
import {
  createAdminPromo,
  updateAdminPromo,
  type AdminPromo,
} from "@/lib/api/promos";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promo: AdminPromo | null;
  token: string;
  onSuccess: () => void;
};

type FormState = {
  title: string;
  description: string;
  banner_url: string;
  code: string;
  discount_type: "fixed" | "percent";
  discount_value: string;
  min_purchase: string;
  max_uses: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
};

function toDateInput(iso: string | undefined | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function buildInitial(promo: AdminPromo | null): FormState {
  if (!promo) {
    return {
      title: "",
      description: "",
      banner_url: "",
      code: "",
      discount_type: "fixed",
      discount_value: "",
      min_purchase: "0",
      max_uses: "",
      valid_from: "",
      valid_until: "",
      is_active: true,
    };
  }
  return {
    title: promo.title,
    description: promo.description ?? "",
    banner_url: promo.banner_url ?? "",
    code: promo.code ?? "",
    discount_type: promo.discount_type,
    discount_value: String(promo.discount_value),
    min_purchase: String(promo.min_purchase),
    max_uses: promo.max_uses ? String(promo.max_uses) : "",
    valid_from: toDateInput(promo.valid_from),
    valid_until: toDateInput(promo.valid_until),
    is_active: promo.is_active,
  };
}

export function PromoFormDialog({ open, onOpenChange, promo, token, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(buildInitial(promo));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(buildInitial(promo));
  }, [promo, open]);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<AdminPromo> = {
        title: form.title,
        description: form.description || undefined,
        banner_url: form.banner_url || undefined,
        code: form.code || undefined,
        discount_type: form.discount_type,
        discount_value: parseInt(form.discount_value, 10),
        min_purchase: parseInt(form.min_purchase || "0", 10),
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : undefined,
        valid_from: form.valid_from,
        valid_until: form.valid_until,
        is_active: form.is_active,
      };

      if (promo) {
        await updateAdminPromo(promo.id, payload, token);
        toast.success("Promo berhasil diupdate");
      } else {
        await createAdminPromo(payload, token);
        toast.success("Promo berhasil dibuat");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan promo");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promo ? "Edit Promo" : "Tambah Promo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Judul Promo *</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="cth. Diskon Lebaran 10%" required />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Opsional" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">URL Banner</label>
            <Input value={form.banner_url} onChange={(e) => set("banner_url", e.target.value)} placeholder="https://..." type="url" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Kode Promo (opsional)</label>
            <Input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="cth. HATAKU10"
              className="uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipe Diskon *</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.discount_type}
                onChange={(e) => set("discount_type", e.target.value as "fixed" | "percent")}
              >
                <option value="fixed">Nominal (Rp)</option>
                <option value="percent">Persen (%)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Nilai {form.discount_type === "percent" ? "(%)" : "(Rp)"} *
              </label>
              <Input
                type="number"
                min={1}
                max={form.discount_type === "percent" ? 100 : undefined}
                value={form.discount_value}
                onChange={(e) => set("discount_value", e.target.value)}
                placeholder={form.discount_type === "percent" ? "cth. 10" : "cth. 5000"}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Min. Pembelian (Rp)</label>
              <Input
                type="number"
                min={0}
                value={form.min_purchase}
                onChange={(e) => set("min_purchase", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Maks. Penggunaan</label>
              <Input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => set("max_uses", e.target.value)}
                placeholder="Tak terbatas"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Berlaku Dari *</label>
              <Input type="date" value={form.valid_from} onChange={(e) => set("valid_from", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Berlaku Sampai *</label>
              <Input type="date" value={form.valid_until} onChange={(e) => set("valid_until", e.target.value)} required />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Aktif</label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : promo ? "Simpan Perubahan" : "Tambah Promo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

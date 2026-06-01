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
import { createProduct, updateProduct } from "@/lib/api/admin-products";
import type { AdminCategory, AdminOptionGroup, AdminProduct, CreateProductPayload } from "@/types/api";

const SAUS_GROUP_ID = 1;
const TOPPING_GROUP_ID = 2;

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (product: AdminProduct) => void;
  product?: AdminProduct | null;
  categories: AdminCategory[];
  optionGroups: AdminOptionGroup[];
  token: string;
};

type FormState = {
  name: string;
  category_id: string;
  description: string;
  price: string;
  photo_url: string;
  sort_order: string;
  is_available: boolean;
  selectedGroupIds: number[];
  overrides: Record<number, { min_select: string; max_select: string }>;
};

function buildInitialState(product?: AdminProduct | null): FormState {
  if (!product) {
    return {
      name: "",
      category_id: "",
      description: "",
      price: "",
      photo_url: "",
      sort_order: "0",
      is_available: true,
      selectedGroupIds: [SAUS_GROUP_ID],
      overrides: {},
    };
  }

  const selectedGroupIds = product.option_groups.map((g) => g.id);
  const overrides: Record<number, { min_select: string; max_select: string }> = {};
  product.option_groups.forEach((g) => {
    if (g.min_select !== g.default_min_select || g.max_select !== g.default_max_select) {
      overrides[g.id] = {
        min_select: String(g.min_select),
        max_select: String(g.max_select),
      };
    }
  });

  return {
    name: product.name,
    category_id: String(product.category.id),
    description: product.description ?? "",
    price: String(product.price),
    photo_url: product.photo_url ?? "",
    sort_order: String(product.sort_order),
    is_available: product.is_available,
    selectedGroupIds,
    overrides,
  };
}

export default function ProductFormDialog({
  open,
  onClose,
  onSuccess,
  product,
  categories,
  optionGroups,
  token,
}: Props) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(product));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(product));
      setErrors({});
    }
  }, [open, product]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGroup(groupId: number) {
    if (groupId === SAUS_GROUP_ID) return;
    setForm((prev) => {
      const has = prev.selectedGroupIds.includes(groupId);
      const next = has
        ? prev.selectedGroupIds.filter((id) => id !== groupId)
        : [...prev.selectedGroupIds, groupId];
      const overrides = { ...prev.overrides };
      if (has) delete overrides[groupId];
      return { ...prev, selectedGroupIds: next, overrides };
    });
  }

  function setOverride(groupId: number, field: "min_select" | "max_select", value: string) {
    setForm((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [groupId]: { ...(prev.overrides[groupId] ?? { min_select: "1", max_select: "1" }), [field]: value },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const price = parseInt(form.price, 10);
    if (isNaN(price) || price < 1) {
      setErrors({ price: ["Harga harus angka lebih dari 0"] });
      return;
    }

    const payload: CreateProductPayload = {
      name: form.name.trim(),
      category_id: parseInt(form.category_id, 10),
      description: form.description.trim() || undefined,
      price,
      photo_url: form.photo_url.trim() || undefined,
      sort_order: parseInt(form.sort_order, 10) || 0,
      is_available: form.is_available,
      option_group_ids: form.selectedGroupIds,
      option_group_overrides: Object.entries(form.overrides)
        .filter(([, v]) => v.min_select && v.max_select)
        .map(([id, v]) => ({
          option_group_id: parseInt(id, 10),
          min_select: parseInt(v.min_select, 10),
          max_select: parseInt(v.max_select, 10),
        })),
    };

    try {
      setLoading(true);
      const res = product
        ? await updateProduct(product.id, payload, token)
        : await createProduct(payload, token);

      if (res.success) {
        toast.success(product ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
        onSuccess(res.data);
        onClose();
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      if (e.message) toast.error(e.message);
      else toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Contoh: Dimsum Original"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setField("category_id", e.target.value)}
              required
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Pilih kategori...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="Contoh: 15000"
              min={1}
              required
            />
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price[0]}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Deskripsi
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Deskripsi singkat produk..."
              rows={2}
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              URL Foto
            </label>
            <Input
              type="url"
              value={form.photo_url}
              onChange={(e) => setField("photo_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Urutan Tampil
            </label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => setField("sort_order", e.target.value)}
              min={0}
            />
          </div>

          {/* Tersedia */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-neutral-700">Tersedia</label>
            <button
              type="button"
              onClick={() => setField("is_available", !form.is_available)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.is_available ? "bg-green-500" : "bg-neutral-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.is_available ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Option Groups */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Pilihan (Option Groups)
            </label>
            <div className="space-y-3 border border-neutral-100 rounded-lg p-3 bg-neutral-50">
              {optionGroups.map((group) => {
                const isSaus = group.id === SAUS_GROUP_ID;
                const isTopping = group.id === TOPPING_GROUP_ID;
                const checked = form.selectedGroupIds.includes(group.id);
                const hasOverride = checked && (isSaus ? false : isTopping);

                return (
                  <div key={group.id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isSaus}
                        onChange={() => toggleGroup(group.id)}
                        className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-neutral-800">{group.name}</span>
                      {isSaus && (
                        <span className="text-xs text-neutral-400">(wajib semua produk)</span>
                      )}
                    </label>

                    {/* Override min/max untuk Topping atau group lain yang dicentang */}
                    {checked && !isSaus && (
                      <div className="ml-6 mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-neutral-500">Min</span>
                          <Input
                            type="number"
                            min={1}
                            value={form.overrides[group.id]?.min_select ?? ""}
                            onChange={(e) => setOverride(group.id, "min_select", e.target.value)}
                            placeholder={String(group.default_min_select)}
                            className="w-16 h-7 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-neutral-500">Max</span>
                          <Input
                            type="number"
                            min={1}
                            value={form.overrides[group.id]?.max_select ?? ""}
                            onChange={(e) => setOverride(group.id, "max_select", e.target.value)}
                            placeholder={String(group.default_max_select)}
                            className="w-16 h-7 text-xs"
                          />
                        </div>
                        <span className="text-xs text-neutral-400">
                          (default: {group.default_min_select}–{group.default_max_select})
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700">
              {loading ? "Menyimpan..." : product ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

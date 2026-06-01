"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import {
  deleteProduct,
  getAdminCategories,
  getAdminProducts,
  toggleProduct,
} from "@/lib/api/admin-products";
import { useAdminAuth } from "@/lib/store/admin-auth";
import type { AdminCategory, AdminOptionGroup, AdminProduct } from "@/types/api";

const ALL_OPTION_GROUPS: AdminOptionGroup[] = [
  { id: 1, name: "Pilihan Saus", is_required: true, default_min_select: 1, default_max_select: 1, min_select: 1, max_select: 1 },
  { id: 2, name: "Pilihan Topping", is_required: true, default_min_select: 2, default_max_select: 4, min_select: 2, max_select: 4 },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

export default function AdminProductsPage() {
  const { token, admin } = useAdminAuth();
  const isAdmin = admin?.role === "admin";

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getAdminProducts(token, { category_id: filterCategoryId, search: search || undefined }),
        getAdminCategories(token),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch {
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  }, [token, filterCategoryId, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggle(product: AdminProduct) {
    if (!token || togglingId === product.id) return;
    setTogglingId(product.id);
    try {
      const res = await toggleProduct(product.id, token);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data : p)));
      toast.success(res.data.is_available ? "Produk diaktifkan" : "Produk dinonaktifkan");
    } catch {
      toast.error("Gagal mengubah status produk");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!token || !isAdmin) return;
    if (!confirm(`Hapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id, token);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Produk berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus produk");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreate() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  function handleSuccess(saved: AdminProduct) {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Produk</h1>
          <Link href="/admin/products/categories" className="text-xs text-red-600 hover:underline">
            Kelola Kategori →
          </Link>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-sm">
            + Tambah Produk
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filterCategoryId ?? ""}
          onChange={(e) =>
            setFilterCategoryId(e.target.value ? parseInt(e.target.value, 10) : undefined)
          }
          className="border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-neutral-400 text-sm">Memuat produk...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm">Belum ada produk</p>
          {isAdmin && (
            <Button onClick={openCreate} className="mt-4 bg-red-600 hover:bg-red-700 text-sm">
              Tambah Produk Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl border p-4 space-y-3 ${
                product.is_deleted ? "opacity-50" : "border-neutral-200"
              }`}
            >
              {/* Image + badges */}
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden">
                  {product.photo_url ? (
                    <img
                      src={product.photo_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-2xl">
                      🍱
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 truncate">{product.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{product.category.name}</p>
                  <p className="text-sm font-bold text-red-600 mt-1">{formatPrice(product.price)}</p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={product.is_available ? "default" : "outline"}
                  className={
                    product.is_available
                      ? "bg-green-100 text-green-700 border-green-200 text-xs"
                      : "text-neutral-400 text-xs"
                  }
                >
                  {product.is_available ? "Tersedia" : "Tidak Tersedia"}
                </Badge>
                {product.is_deleted && (
                  <Badge variant="outline" className="text-red-400 border-red-200 text-xs">
                    Terhapus
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                {/* Toggle — semua role bisa */}
                <button
                  onClick={() => handleToggle(product)}
                  disabled={togglingId === product.id || product.is_deleted}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                    product.is_available ? "bg-green-500" : "bg-neutral-300"
                  }`}
                  title={product.is_available ? "Nonaktifkan" : "Aktifkan"}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      product.is_available ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-xs text-neutral-400 flex-1">
                  {togglingId === product.id ? "..." : product.is_available ? "Aktif" : "Nonaktif"}
                </span>

                {/* Edit + Delete — admin only */}
                {isAdmin && !product.is_deleted && (
                  <>
                    <button
                      onClick={() => openEdit(product)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      {deletingId === product.id ? "..." : "Hapus"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
        product={editingProduct}
        categories={categories}
        optionGroups={ALL_OPTION_GROUPS}
        token={token ?? ""}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from "@/lib/api/admin-products";
import { useAdminAuth } from "@/lib/store/admin-auth";
import type { AdminCategory } from "@/types/api";

export default function AdminCategoriesPage() {
  const { token, admin } = useAdminAuth();
  const isAdmin = admin?.role === "admin";

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // New category form
  const [newName, setNewName] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("0");
  const [creating, setCreating] = useState(false);

  // Inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAdminCategories(token);
      setCategories(res.data);
    } catch {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setCreating(true);
    try {
      const res = await createCategory(
        { name: newName.trim(), sort_order: parseInt(newSortOrder, 10) || 0 },
        token
      );
      setCategories((prev) => [...prev, res.data].sort((a, b) => a.sort_order - b.sort_order));
      setNewName("");
      setNewSortOrder("0");
      toast.success("Kategori berhasil ditambahkan");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e.message ?? "Gagal menambah kategori");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: AdminCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSortOrder(String(cat.sort_order));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSave(id: number) {
    if (!token) return;
    setSaving(true);
    try {
      const res = await updateCategory(
        id,
        { name: editName.trim(), sort_order: parseInt(editSortOrder, 10) || 0 },
        token
      );
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? res.data : c)).sort((a, b) => a.sort_order - b.sort_order)
      );
      setEditingId(null);
      toast.success("Kategori berhasil diperbarui");
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: AdminCategory) {
    if (!token || !isAdmin) return;
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try {
      await deleteCategory(cat.id, token);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Kategori berhasil dihapus");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e.message ?? "Gagal menghapus kategori");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-xs text-neutral-400 hover:text-red-600">
            ← Kembali ke Produk
          </Link>
          <h1 className="text-xl font-bold text-neutral-900 mt-0.5">Kelola Kategori</h1>
        </div>
      </div>

      {/* Add new — admin only */}
      {isAdmin && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-neutral-700">Tambah Kategori Baru</p>
          <div className="flex gap-2 flex-wrap">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kategori..."
              required
              className="flex-1 min-w-40"
            />
            <Input
              type="number"
              value={newSortOrder}
              onChange={(e) => setNewSortOrder(e.target.value)}
              placeholder="Urutan"
              min={0}
              className="w-24"
              title="Urutan tampil (sort_order)"
            />
            <Button type="submit" disabled={creating} className="bg-red-600 hover:bg-red-700">
              {creating ? "..." : "Tambah"}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400 text-sm">Memuat...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-sm">Belum ada kategori</div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {categories.map((cat) => (
            <div key={cat.id} className="px-4 py-3">
              {editingId === cat.id ? (
                <div className="flex gap-2 items-center flex-wrap">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 min-w-40 h-8 text-sm"
                    autoFocus
                  />
                  <Input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value)}
                    className="w-20 h-8 text-sm"
                    min={0}
                    title="Urutan tampil"
                  />
                  <button
                    onClick={() => handleSave(cat.id)}
                    disabled={saving}
                    className="text-sm text-green-600 font-medium hover:underline disabled:opacity-50"
                  >
                    {saving ? "..." : "Simpan"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-sm text-neutral-400 hover:underline"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                    <span className="ml-2 text-xs text-neutral-400">
                      #{cat.sort_order} · {cat.products_count} produk
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 flex-shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deletingId === cat.id ? "..." : "Hapus"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

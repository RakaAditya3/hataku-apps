"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAdminCustomers } from "@/lib/api/admin-customers";
import { useAdminAuth } from "@/lib/store/admin-auth";
import type { AdminCustomer, CustomerTier } from "@/types/api";

const TIER_LABELS: Record<CustomerTier, string> = {
  bamboo:   "Bamboo",
  jade:     "Jade",
  imperial: "Imperial",
  dragon:   "Dragon",
};

const TIER_COLORS: Record<CustomerTier, string> = {
  bamboo:   "bg-green-100 text-green-700 border-green-200",
  jade:     "bg-teal-100 text-teal-700 border-teal-200",
  imperial: "bg-purple-100 text-purple-700 border-purple-200",
  dragon:   "bg-red-100 text-red-700 border-red-200",
};

const TIER_OPTIONS: { value: string; label: string }[] = [
  { value: "",         label: "Semua Tier" },
  { value: "bamboo",   label: "Bamboo" },
  { value: "jade",     label: "Jade" },
  { value: "imperial", label: "Imperial" },
  { value: "dragon",   label: "Dragon" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const { token } = useAdminAuth();

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadCustomers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAdminCustomers(token, {
        search: search || undefined,
        tier: filterTier || undefined,
        page,
      });
      setCustomers(res.data);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
    } catch {
      toast.error("Gagal memuat data customer");
    } finally {
      setLoading(false);
    }
  }, [token, search, filterTier, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filterTier]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Customers</h1>
        <p className="text-sm text-neutral-400 mt-0.5">{total} customer terdaftar</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Cari nama / email / telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {TIER_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-neutral-400 text-sm">Memuat customer...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm">Tidak ada customer ditemukan</div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Telepon</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Tier</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-500">Point</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-500">Transaksi Valid</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/admin/customers/${c.id}`)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900">{c.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.email}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${TIER_COLORS[c.tier]}`}
                      >
                        {TIER_LABELS[c.tier]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-neutral-900">{c.point_balance.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">{c.valid_transaction_count}×</td>
                    <td className="px-4 py-3 text-neutral-500">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-neutral-100">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/admin/customers/${c.id}`)}
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{c.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{c.email}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{c.phone ?? "No. telepon belum diisi"}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                  <Badge variant="outline" className={`text-xs ${TIER_COLORS[c.tier]}`}>
                    {TIER_LABELS[c.tier]}
                  </Badge>
                  <span className="text-xs text-neutral-500">{c.point_balance.toLocaleString("id-ID")} pt</span>
                  <span className="text-xs text-neutral-400">{c.valid_transaction_count}× valid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-neutral-400">Halaman {page} dari {lastPage}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
            >
              ← Sebelumnya
            </button>
            <button
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

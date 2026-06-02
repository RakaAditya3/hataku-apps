"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPointHistory, type PointTransaction } from "@/lib/api/loyalty";

const TYPE_LABELS: Record<string, string> = {
  earn: "Transaksi",
  redeem: "Penukaran",
  refund: "Refund",
  referral: "Referral",
  checkin: "Check-in",
  adjustment: "Penyesuaian",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PointHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.sanctumToken) return;
    loadPage(1);
  }, [status, session]);

  async function loadPage(page: number) {
    if (!session?.user.sanctumToken) return;
    page === 1 ? setIsLoading(true) : setIsLoadingMore(true);
    try {
      const res = await getPointHistory(session.user.sanctumToken, page);
      if (res.success) {
        setTransactions((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setCurrentPage(res.meta.current_page);
        setLastPage(res.meta.last_page);
      }
    } catch {
      // ignore
    } finally {
      page === 1 ? setIsLoading(false) : setIsLoadingMore(false);
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
          <Link href="/rewards" className="text-muted-foreground hover:text-foreground">←</Link>
          <h1 className="text-base font-bold">Riwayat Point</h1>
        </header>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Memuat...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/rewards" className="text-muted-foreground hover:text-foreground">←</Link>
        <h1 className="text-base font-bold">Riwayat Point</h1>
      </header>

      <div className="divide-y">
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Belum ada transaksi point
          </div>
        ) : (
          transactions.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isPositive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isPositive ? "+" : "-"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{TYPE_LABELS[tx.type] ?? tx.type}</p>
                  {tx.note && (
                    <p className="text-xs text-muted-foreground truncate">{tx.note}</p>
                  )}
                  {tx.order_code && (
                    <p className="text-xs text-muted-foreground">Order: {tx.order_code}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDate(tx.created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      isPositive ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isPositive ? "+" : ""}{tx.amount} pt
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Saldo: {tx.balance_after} pt
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {currentPage < lastPage && (
        <div className="px-4 pt-4 pb-8">
          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={isLoadingMore}
            className="w-full py-2 text-sm text-orange-600 font-medium border border-orange-200 rounded-lg hover:bg-orange-50"
          >
            {isLoadingMore ? "Memuat..." : "Muat lebih banyak"}
          </button>
        </div>
      )}
    </main>
  );
}

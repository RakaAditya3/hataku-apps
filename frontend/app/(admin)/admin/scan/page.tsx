"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { getAdminOrder, scanOrder } from "@/lib/api/admin";
import { formatRupiah } from "@/lib/utils/format";
import type { Order } from "@/types/api";

type ScanStep = "input" | "confirm" | "success";

export default function ScanPage() {
  const { token } = useAdminAuth();
  const [step, setStep] = useState<ScanStep>("input");
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  async function handleLookup(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || !token) return;

    setLoadingLookup(true);
    try {
      const res = await getAdminOrder(trimmed, token);
      setOrder(res.data);
      setStep("confirm");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pesanan tidak ditemukan";
      toast.error(msg);
    } finally {
      setLoadingLookup(false);
    }
  }

  async function handleConfirm() {
    if (!order || !token) return;
    setLoadingConfirm(true);
    try {
      const res = await scanOrder(order.order_code, token);
      setOrder(res.data);
      setStep("success");
      stopCamera();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal konfirmasi";
      toast.error(msg);
    } finally {
      setLoadingConfirm(false);
    }
  }

  function handleReset() {
    setStep("input");
    setCode("");
    setOrder(null);
  }

  function stopCamera() {
    if (scannerRef.current) {
      try {
        scannerRef.current.reset();
      } catch {
        //
      }
      scannerRef.current = null;
    }
    setCameraEnabled(false);
  }

  async function startCamera() {
    setCameraEnabled(true);
  }

  useEffect(() => {
    if (!cameraEnabled || !videoRef.current || step !== "input") return;

    let active = true;

    import("@zxing/browser").then(({ BrowserQRCodeReader }) => {
      if (!active || !videoRef.current) return;

      const reader = new BrowserQRCodeReader();
      scannerRef.current = reader;

      reader
        .decodeOnceFromVideoDevice(undefined, videoRef.current)
        .then((result) => {
          if (!active) return;
          const text = result.getText();
          setCode(text);
          stopCamera();
          // auto-trigger lookup after camera scan
          setTimeout(() => {
            setCode(text);
          }, 100);
        })
        .catch(() => {
          // camera closed / permission denied
        });
    });

    return () => {
      active = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraEnabled, step]);

  // Auto-lookup when code is set from camera scan
  useEffect(() => {
    if (code && cameraEnabled === false && step === "input") {
      handleLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (step === "success" && order) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">
            ✅
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-1">Pesanan Diproses</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Pesanan <span className="font-mono font-semibold">{order.order_code}</span> sedang
            diproses.
          </p>
          <button
            onClick={handleReset}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm"
          >
            Scan Berikutnya
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm" && order) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Konfirmasi Pembayaran</h2>

          <div className="bg-neutral-50 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Order</span>
              <span className="font-mono font-semibold">{order.order_code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Customer</span>
              <span className="font-medium">{order.user?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tipe</span>
              <span>{order.order_type === "dine_in" ? "Dine In" : "Takeaway"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-neutral-400 mb-1.5">Item Pesanan</p>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="text-sm flex justify-between">
                  <span className="text-neutral-700">
                    {item.product_name} ×{item.quantity}
                    {item.options.length > 0 && (
                      <span className="text-neutral-400 text-xs">
                        {" "}
                        ({item.options.map((o) => o.option_name).join(", ")})
                      </span>
                    )}
                  </span>
                  <span className="text-neutral-600">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-3 mb-5">
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-red-600">{formatRupiah(order.total)}</span>
            </div>
          </div>

          {order.status !== "pending" && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              Pesanan ini tidak lagi berstatus pending (status: {order.status}).
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 font-medium rounded-lg text-sm hover:bg-neutral-50"
            >
              Kembali
            </button>
            <button
              onClick={handleConfirm}
              disabled={loadingConfirm || order.status !== "pending"}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm"
            >
              {loadingConfirm ? "Memproses..." : "Konfirmasi Bayar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Scan QR</h1>

      {/* Manual input */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4">
        <p className="text-sm font-medium text-neutral-700 mb-3">Input kode pesanan</p>
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="HTK-20240601-0001"
            className="flex-1 px-3 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={!code.trim() || loadingLookup}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm"
          >
            {loadingLookup ? "..." : "Cari"}
          </button>
        </form>
      </div>

      {/* Camera QR scanner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-neutral-700">Scan via kamera</p>
          {cameraEnabled && (
            <button
              onClick={stopCamera}
              className="text-xs text-neutral-400 hover:text-red-500"
            >
              Tutup
            </button>
          )}
        </div>

        {cameraEnabled ? (
          <div className="relative rounded-xl overflow-hidden bg-neutral-900">
            <video ref={videoRef} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white rounded-2xl opacity-70" />
            </div>
            <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/70">
              Arahkan kamera ke QR code
            </p>
          </div>
        ) : (
          <button
            onClick={startCamera}
            className="w-full aspect-square max-h-48 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-red-300 hover:text-red-500 transition-colors"
          >
            <span className="text-3xl">📷</span>
            <span className="text-sm">Aktifkan Kamera</span>
          </button>
        )}
      </div>
    </div>
  );
}

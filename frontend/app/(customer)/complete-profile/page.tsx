"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/api/auth";

const schema = z.object({
  phone: z
    .string()
    .min(10, "Nomor HP minimal 10 digit")
    .max(20, "Nomor HP terlalu panjang")
    .regex(/^[0-9]+$/, "Nomor HP hanya boleh berisi angka"),
});

export default function CompleteProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = schema.safeParse({ phone });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    if (!session?.user.sanctumToken) {
      setError("Sesi tidak valid. Silakan login ulang.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({ phone }, session.user.sanctumToken);

      if (!res.success) {
        setError("Gagal menyimpan nomor HP. Coba lagi.");
        return;
      }

      // Update session so middleware phone check passes
      await update({ phone });
      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-orange-600">HATAKU</h1>
          <h2 className="text-xl font-semibold">Lengkapi Profil</h2>
          <p className="text-sm text-muted-foreground">
            Masukkan nomor HP untuk menerima notifikasi pesanan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium">
              Nomor HP
            </label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ""));
                setError(null);
              }}
              className="h-12 text-base"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan & Lanjutkan"}
          </Button>
        </form>
      </div>
    </main>
  );
}

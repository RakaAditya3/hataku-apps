"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#7B4F2E" }}>
      {/* Hero gradient */}
      <div className="h-[30vh] bg-linear-to-b from-[#C4956A] to-primary-dark flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-3 shadow-lg">
          <Image
            src="/icons/icon-512x512.png"
            width={64}
            height={64}
            alt="HATAKU"
            className="rounded-xl"
            priority
          />
        </div>
        <h1 className="text-white font-bold text-xl mt-3 tracking-tight">
          HATAKU DIMSUM
        </h1>
      </div>

      {/* Bottom card */}
      <div className="flex-1 bg-cream rounded-t-3xl -mt-8 px-6 pt-8 pb-12">
        <h2 className="font-bold text-2xl text-primary-dark">
          Satu langkah lagi!
        </h2>
        <p className="text-sm text-subtext mt-2 leading-relaxed">
          Masukkan nomor HP kamu untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Phone input with +62 prefix */}
          <div>
            <div className="flex h-14 bg-white border border-hairline rounded-xl overflow-hidden">
              <div className="flex items-center px-4 border-r border-hairline shrink-0">
                <span className="text-primary-dark font-semibold text-sm">+62</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="8xx-xxxx-xxxx"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
                className="flex-1 px-4 text-body-text outline-none bg-transparent text-base placeholder:text-subtext"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-price text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full h-14 bg-[#C4956A] rounded-full text-white font-semibold text-base disabled:opacity-50 transition-opacity active:scale-95"
          >
            {loading ? "Menyimpan..." : "Lanjutkan"}
          </button>
        </form>
      </div>
    </div>
  );
}

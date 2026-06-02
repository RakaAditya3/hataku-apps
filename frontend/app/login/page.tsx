import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { LoginButton } from "./login-button";

export const metadata: Metadata = {
  title: "Masuk — HATAKU",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#7B4F2E" }}>
      {/* Hero gradient section */}
      <div className="h-[45vh] bg-linear-to-b from-[#C4956A] to-primary-dark flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-3 shadow-lg">
          <Image
            src="/icons/icon-512x512.png"
            width={80}
            height={80}
            alt="HATAKU"
            className="rounded-xl"
            priority
          />
        </div>
        <h1 className="text-white font-bold text-2xl mt-4 tracking-tight">
          HATAKU DIMSUM
        </h1>
        <p className="text-white/70 text-sm mt-1">Dimsum &amp; Gyoza</p>
      </div>

      {/* Bottom sheet — overlaps hero by 32px */}
      <div className="flex-1 bg-cream rounded-t-3xl -mt-8 px-6 pt-8 pb-12 flex flex-col">
        <h2 className="font-bold text-2xl text-primary-dark">Masuk ke HATAKU</h2>
        <p className="text-sm text-subtext mt-2 leading-relaxed">
          Pesan dimsum favoritmu, kumpulkan poin!
        </p>

        <div className="mt-8">
          <LoginButton />
        </div>

        <p className="text-xs text-subtext text-center mt-6 leading-relaxed">
          Dengan masuk, kamu setuju dengan{" "}
          <span className="text-[#C4956A] font-medium">Syarat &amp; Ketentuan</span>
          {" "}HATAKU.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("hataku_splashed", "1");
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDF6EC]">
      <div className="hataku-anim-logo">
        <Image
          src="/icons/icon-512x512.png"
          width={120}
          height={120}
          alt="HATAKU"
          className="rounded-2xl shadow-md"
          priority
        />
      </div>

      <p className="font-bold text-2xl text-[#7B4F2E] mt-4 hataku-anim-fade-1">
        HATAKU DIMSUM
      </p>

      <p className="font-normal text-sm text-[#9B9B9B] mt-1 hataku-anim-fade-2">
        Dimsum &amp; Gyoza
      </p>

      <p className="italic text-sm text-[#C4956A] mt-6 hataku-anim-fade-3">
        Pesan, Kumpulkan, Nikmati
      </p>
    </div>
  );
}

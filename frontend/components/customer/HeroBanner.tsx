"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import type { Promo } from "@/lib/api/promos";

interface HeroBannerProps {
  promos: Promo[];
}

export function HeroBanner({ promos }: HeroBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActiveIndex(index);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  if (promos.length === 0) {
    return (
      <div className="mx-4 mt-4 h-[180px] rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center">
        <div className="text-center text-white">
          <p className="font-bold text-xl">HATAKU DIMSUM</p>
          <p className="text-sm opacity-80 mt-1">Pesan, Kumpulkan, Nikmati</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mx-4 rounded-2xl overflow-hidden">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="shrink-0 w-full h-[180px] snap-start relative"
            >
              {promo.banner_url ? (
                <Image
                  src={promo.banner_url}
                  alt={promo.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-primary to-primary-dark flex flex-col justify-end p-5">
                  <p className="text-white font-bold text-lg leading-tight">{promo.title}</p>
                  {promo.description && (
                    <p className="text-white/80 text-sm mt-1">{promo.description}</p>
                  )}
                </div>
              )}
              {promo.code && (
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/90 text-primary-dark text-xs font-bold px-3 py-1 rounded-full">
                    Kode: {promo.code}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {promos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {promos.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-primary/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

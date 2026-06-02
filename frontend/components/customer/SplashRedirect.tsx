"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SplashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("hataku_splashed")) {
      router.push("/splash");
    }
  }, [router]);

  return null;
}

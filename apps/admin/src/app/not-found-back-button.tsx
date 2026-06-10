"use client";

import { useRouter } from "next/navigation";
import { buttonClass } from "@/components/ui";

// "Geri dön" — tarayıcı geçmişinde bir önceki sayfaya döner; geçmiş yoksa
// (doğrudan açılan 404) güvenli biçimde panel köküne (/teklifler) düşer.
// Küçük client bileşeni; not-found.tsx server component kalır (docs/05).
export function NotFoundBackButton() {
  const router = useRouter();

  function goBack() {
    // history.length <= 1 ise gidilecek önceki sayfa yok → panele düş.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/teklifler");
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={buttonClass("primary")}
      aria-label="Bir önceki sayfaya geri dön"
    >
      Geri dön
    </button>
  );
}

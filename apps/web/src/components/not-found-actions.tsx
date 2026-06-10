"use client";

// 404 sayfası eylem butonları (docs/02 404, docs/09 buton dili).
// "Geri dön" tarayıcı geçmişine döner; geçmiş yoksa (doğrudan giriş / yeni sekme)
// anasayfaya düşer. "Anasayfaya dön" locale-farkında Link ile /{locale}'e gider.
// Butonlar docs/09: pill, birincil (dolu turuncu) + hayalet (çerçeveli).

import { useTranslations } from "next-intl";
import { ArrowLeft, Home } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";

export function NotFoundActions() {
  const t = useTranslations("notFound");
  const router = useRouter();

  // Tarayıcı geçmişi varsa geri git; yoksa (doğrudan giriş) anasayfaya düş.
  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
      {/* Birincil — turuncu dolu pill (docs/09). */}
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive px-6 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(9_84%_38%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
        {t("back")}
      </button>
      {/* Hayalet — çerçeveli pill (docs/09). */}
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-foreground px-6 py-3 text-base font-bold text-foreground transition hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Home className="h-5 w-5" aria-hidden />
        {t("home")}
      </Link>
    </div>
  );
}

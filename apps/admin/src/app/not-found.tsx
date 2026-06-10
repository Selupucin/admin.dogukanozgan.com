import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { NotFoundBackButton } from "./not-found-back-button";

// Admin'e özel 404 sayfası (Next.js App Router not-found).
// RootLayout (app/layout.tsx) <html>/<body> + ThemeProvider + NextIntlClientProvider
// kurduğu için bu sayfa admin temasını (koyu lacivert + Fraunces) alır.
// Tüm admin domaini zaten noindex (layout metadata); not-found 404 statü döndürür.
// Kaynak: docs/05 (admin panel), docs/09 (tasarım — koyu lacivert, Fraunces, kart/gölge).
export const metadata: Metadata = {
  title: "Sayfa bulunamadı — Yönetim",
  robots: { index: false, follow: false, nocache: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
        <p className="font-heading text-7xl font-semibold leading-none text-primary sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground">
          Sayfa bulunamadı
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. Aşağıdan geri dönebilir
          ya da yönetim paneline geçebilirsiniz.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <NotFoundBackButton />
          <Link
            href="/teklifler"
            className={buttonClass("outline")}
            aria-label="Yönetim paneline dön"
          >
            Panele dön
          </Link>
        </div>
      </div>
    </main>
  );
}

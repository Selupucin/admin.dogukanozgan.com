"use client";

// Sticky + blur header (docs/09 "Header"): wordmark + menü + "Ücretsiz Teklif Al"
// + dil ve tema değiştirici. Mobilde hamburger menü.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

const navItems = [
  { key: "plans", href: "/planlar" },
  { key: "about", href: "/hakkimda" },
  { key: "faq", href: "/sss" },
  { key: "contact", href: "/iletisim" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label={tc("brand")}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Wordmark />
        </Link>

        {/* Masaüstü menü */}
        <nav aria-label={t("primary")} className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group relative py-1 text-sm font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
            >
              {t(item.key)}
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          <Link
            href="/planlar"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_10px_24px_-10px_hsl(var(--destructive))] transition hover:-translate-y-0.5 hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
          >
            {tc("getQuote")}
          </Link>

          {/* Mobil menü düğmesi */}
          <button
            type="button"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil açılır menü */}
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav
            aria-label={t("primary")}
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6"
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-semibold text-foreground transition hover:bg-muted"
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href="/planlar"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-base font-bold text-primary-foreground transition hover:bg-destructive"
            >
              {tc("getQuote")}
            </Link>
            <div className="mt-3 flex items-center justify-between sm:hidden">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

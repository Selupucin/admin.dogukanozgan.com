"use client";

// Tema değiştirici (dark/light) — docs/07. next-themes ile.
// Hydration uyumsuzluğunu önlemek için mount sonrası ikon gösterilir.

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={t("toggleTheme")}
      title={t("toggleTheme")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* mount öncesi nötr ikon (Sun) — CLS/hydration güvenli */}
      {mounted && isDark ? (
        <Moon className="h-[18px] w-[18px]" aria-hidden />
      ) : (
        <Sun className="h-[18px] w-[18px]" aria-hidden />
      )}
    </button>
  );
}

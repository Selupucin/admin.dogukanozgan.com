// Site kabuğu — her sayfada TopBar + Header + içerik + Footer + sabit FAB.
// Kaynak: docs/02 "Global Bileşenler", docs/09 anasayfa düzeni.

import type { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { Header } from "./header";
import { Footer } from "./footer";
import { FloatingActions } from "./floating-actions";
import type { Locale } from "@/i18n/routing";

export function SiteShell({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <div className="grain-overlay flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer locale={locale} />
      <FloatingActions />
    </div>
  );
}

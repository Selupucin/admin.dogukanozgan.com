// Admin üst çubuğu — marka, gezinme, oturum kapatma.
// Korumalı sayfalarda (teklifler) gösterilir; login'de gösterilmez.

import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { buttonClass } from "@/components/ui";

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/teklifler" className="flex flex-col">
          <span className="font-heading text-lg font-semibold leading-tight">Doğukan Özgan</span>
          <span className="text-xs text-muted-foreground">Yönetim Paneli</span>
        </Link>
        <div className="flex items-center gap-3">
          {email && <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>}
          <form action={signOutAction}>
            <button type="submit" className={buttonClass("outline", "sm")}>
              Çıkış
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

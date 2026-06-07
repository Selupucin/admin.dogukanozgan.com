import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";

// Korumalı bölüm yerleşimi — üst çubuk + oturum bilgisi. Erişim middleware ile korunur.
export default async function IletisimLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={session?.user?.email} />
      {children}
    </div>
  );
}

import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAdminSecurity, logError } from "@do/db";
import { SecuritySettings } from "./security-settings";

export const metadata: Metadata = {
  title: "Ayarlar — Yönetim",
  robots: { index: false, follow: false, nocache: true },
};

// Ayarlar sayfası (korumalı) — güvenlik: boşta kilit süresi + PIN değiştir + PIN sıfırla.
// docs/05 "Boşta Kilit / PIN". Tüm değişiklikler server action'larla (security-actions.ts).
export default async function AyarlarPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  let hasPin = false;
  let lockTimeoutMinutes = 15;
  try {
    const sec = await getAdminSecurity(email);
    hasPin = sec.hasPin;
    lockTimeoutMinutes = sec.lockTimeoutMinutes;
  } catch (err) {
    logError("[ayarlar] güvenlik durumu çekme hatası:", err);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-heading text-2xl font-semibold">Ayarlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Hesap güvenliği ve boşta kilit ayarları.</p>

      <div className="mt-8">
        <SecuritySettings initialLockTimeout={lockTimeoutMinutes} hasPin={hasPin} />
      </div>
    </main>
  );
}

import type { ReactNode } from "react";
import { auth } from "@/auth";
import { getAdminSecurity, logError } from "@do/db";
import { AppHeader } from "@/components/app-header";
import { PinLockGuard } from "@/components/pin-lock-guard";

// Korumalı bölüm kabuğu — üst çubuk + PIN kilit yöneticisi. Tüm korumalı layout'lar
// (teklifler/iletisim-talepleri/policeler/ayarlar) bunu kullanır (DRY). Erişim
// middleware ile korunur; burada kullanıcı e-postası + PIN güvenlik durumu çekilir.
//
// PIN kilit (docs/05): hasPin=false ise PinLockGuard kapatılamaz kurulum modalı gösterir;
// lockTimeoutMinutes>0 ise boşta kalınca tam ekran kilit overlay'i devreye girer.
export async function ProtectedShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? null;

  // Güvenlik durumu (PIN var mı + kilit süresi). DB yoksa güvenli varsayılan: PIN
  // izleme devre dışı (hasPin=true sayılır ki modal sürekli açılmasın); login zaten
  // DB gerektirir, bu sadece DB kesintisinde paneli kilitli bırakmamak içindir.
  let hasPin = true;
  let lockTimeoutMinutes = 0;
  if (email) {
    try {
      const sec = await getAdminSecurity(email);
      hasPin = sec.hasPin;
      lockTimeoutMinutes = sec.lockTimeoutMinutes;
    } catch (err) {
      logError("[protected-shell] güvenlik durumu çekme hatası:", err);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader email={email} />
      {children}
      {email && (
        <PinLockGuard hasPin={hasPin} lockTimeoutMinutes={lockTimeoutMinutes} email={email} />
      )}
    </div>
  );
}

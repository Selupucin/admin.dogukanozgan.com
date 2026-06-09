import type { ReactNode } from "react";
import { ProtectedShell } from "@/components/protected-shell";

// Ayarlar — korumalı kabuk (üst çubuk + PIN kilit). Erişim middleware ile korunur.
export default function AyarlarLayout({ children }: { children: ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

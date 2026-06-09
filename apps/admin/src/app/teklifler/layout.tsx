import type { ReactNode } from "react";
import { ProtectedShell } from "@/components/protected-shell";

// Korumalı bölüm yerleşimi — ortak kabuk (üst çubuk + PIN kilit). Erişim middleware ile korunur.
export default function TekliflerLayout({ children }: { children: ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

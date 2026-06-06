import { redirect } from "next/navigation";

// Admin kökü → teklif listesine yönlendir. Erişim middleware ile korunur:
// oturum yoksa /login'e, varsa /teklifler'e gider (docs/05).
export default function AdminIndex() {
  redirect("/teklifler");
}

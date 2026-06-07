import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ManualForm } from "./manual-form";

export const metadata: Metadata = {
  title: "Manuel Kayıt — Yönetim",
  robots: { index: false, follow: false },
};

export default function ManualQuotePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/teklifler" className="text-sm text-muted-foreground hover:text-foreground">
        ← Tekliflere dön
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold">Manuel Poliçe / Müşteri Ekle</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Web dışı (telefon/yüz yüze) müşteriler için kayıt oluşturun. Kayıt listede ve poliçe
        takviminde görünür (kaynak: Manuel).
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Yeni Kayıt</CardTitle>
        </CardHeader>
        <CardContent>
          <ManualForm />
        </CardContent>
      </Card>
    </main>
  );
}

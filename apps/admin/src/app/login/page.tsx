import type { Metadata } from "next";
import { LoginForm } from "./login-form";

// Giriş sayfası — Auth.js Credentials. Korumalı değildir (middleware login'i serbest bırakır).
// Kaynak: docs/05 "Giriş — /login", docs/01 (ayrı domain, noindex).
export const metadata: Metadata = {
  title: "Giriş — Yönetim",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-semibold">Doğukan Özgan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Yönetim Paneli</p>
      </div>
      <div className="w-full rounded-lg border border-border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Bu alan yalnızca yetkili kullanıcılar içindir.
      </p>
    </main>
  );
}

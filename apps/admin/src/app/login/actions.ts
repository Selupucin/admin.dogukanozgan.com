"use server";

// Giriş Server Action'ı — Auth.js Credentials ile oturum açar.
// Kaynak: docs/05 "Giriş", "Hatalı denemede genel hata mesajı (kullanıcı sızdırmaz)".

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/teklifler",
    });
    return {};
  } catch (error) {
    // NextAuth, başarılı girişte redirect atar; bu özel hatayı yeniden fırlat.
    if (error instanceof AuthError) {
      // Tüm credentials hataları için TEK genel mesaj (kullanıcı/şifre ayrımı yok).
      return { error: "E-posta veya şifre hatalı." };
    }
    throw error;
  }
}

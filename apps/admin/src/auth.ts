// Auth.js (NextAuth v5) TAM yapılandırması — route handler + server action'lar bunu kullanır.
// Kaynak: docs/05 "Kimlik Doğrulama", docs/01 (ayrı domain, AUTH_SECRET).
//
// - Edge-güvenli temel ayarlar src/auth.config.ts'te (middleware oradan türetir).
// - Burada Credentials provider'ın DB erişimli `authorize`'ı eklenir (Node runtime).
// - Oturum stratejisi JWT (DB session/adapter GEREKMEZ — tek/az admin, docs/04).
// - AUTH_SECRET .env'den gelir (oturum çerezi şifreleme). docs/01.

import NextAuth, { type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyAdminCredentials } from "@do/db";
import { authConfig } from "./auth.config";

// Açık tip: NextAuth v5 beta'da çıkarımlı dönüş tipi @auth/core iç yollarına
// referans verip "portable değil" (TS2742) hatası verir; NextAuthResult ile bağlarız.
const nextAuth: NextAuthResult = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await verifyAdminCredentials(email, password);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
});

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;

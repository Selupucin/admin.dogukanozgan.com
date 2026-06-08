// Auth.js — EDGE-GÜVENLİ temel yapılandırma (middleware bunu kullanır).
// Kaynak: docs/05 (tüm rotalar korumalı), Auth.js v5 "split config" deseni.
//
// ⚠️ Middleware Edge runtime'da çalışır → burada prisma/bcrypt gibi Node-only
// bağımlılık OLMAMALI. Credentials provider'ın `authorize` (DB erişimli) kısmı
// yalnızca src/auth.ts'tedir; burada providers BOŞ bırakılır. JWT oturumu
// olduğu için middleware token'ı DB'siz doğrulayabilir.

import type { NextAuthConfig } from "next-auth";

// Secret açıkça bağlanır: Auth.js v5 normalde AUTH_SECRET'i otomatik okur; burada
// hem AUTH_SECRET hem (v4 adı) NEXTAUTH_SECRET kabul edilerek isim karışıklığı önlenir.
// docs/13 §O2 — FAIL-FAST: production'da secret yoksa modül yüklenirken NET hata ver
// (sessiz fallback ile imzasız/zayıf oturum üretilmesini engelle). Dev'de sessiz geçilir
// (Auth.js dev'de geçici bir secret türetebilir).
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error(
    "AUTH_SECRET zorunludur (production). AUTH_SECRET veya NEXTAUTH_SECRET tanımlayın " +
      "(`openssl rand -base64 32`). docs/13 §O2.",
  );
}

// Statik oturum/çerez ömrü ÜST SINIRI. Gerçek geçerlilik JWT'deki `sessionExpiresAt`
// claim'i ile belirlenir (docs/05 — "Beni hatırla" + süre seçimi). Bu üst sınırı uzun
// tutarız ("her zaman" ~10 yıl seçeneğini de kapsasın) ki kısa süreli oturumlar maxAge
// nedeniyle erken DÜŞMESİN; asıl kesme `sessionExpiresAt` kontrolüyle yapılır.
const MAX_SESSION_AGE_SECONDS = 3650 * 24 * 60 * 60; // ~10 yıl

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: MAX_SESSION_AGE_SECONDS },
  trustHost: true,
  // Bu ayar hem middleware (auth.config) hem auth.ts (spread) tarafından kullanılır.
  secret,
  pages: {
    signIn: "/login",
  },
  // Edge'de provider'a gerek yok (token kontrolü yeterli). Tam liste auth.ts'te.
  providers: [],
  callbacks: {
    // Tüm admin rotalarını koru; oturum yoksa /login'e yönlendir (docs/05).
    // /login ve /api/auth/* serbest bırakılır (sonsuz döngü olmasın).
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Oturum geçerli mi? token'daki `sessionExpiresAt` claim'i süresini belirler
      // (docs/05 — seçilen "Beni hatırla" süresi). Süresi geçmişse oturum YOK sayılır.
      const expiresAt =
        typeof auth?.sessionExpiresAt === "number" ? auth.sessionExpiresAt : undefined;
      const notExpired = expiresAt === undefined || Date.now() <= expiresAt;
      const isLoggedIn = Boolean(auth?.user) && notExpired;

      const isAuthRoute = pathname.startsWith("/api/auth");
      const isLoginPage = pathname === "/login";

      if (isAuthRoute) return true;

      if (isLoginPage) {
        // Giriş yapmış kullanıcı login'e gelirse listeye gönder.
        if (isLoggedIn) {
          return Response.redirect(new URL("/teklifler", request.nextUrl));
        }
        return true;
      }

      // Diğer tüm rotalar korumalı.
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      // İlk girişte (user var): rol + oturum bitiş zamanını (sessionExpiresAt) ayarla.
      // authorize, ticket'taki remember/duration'a göre `sessionMaxAgeMs` döndürdü.
      if (user && "role" in user) {
        token.role = (user as { role?: string }).role ?? "ADMIN";
        const maxAgeMs = (user as { sessionMaxAgeMs?: number }).sessionMaxAgeMs;
        if (typeof maxAgeMs === "number" && maxAgeMs > 0) {
          token.sessionExpiresAt = Date.now() + maxAgeMs;
        }
      }
      // Sonraki çağrılarda: süresi geçmişse token'ı GEÇERSİZ kıl (boş döndür → oturum düşer).
      const exp = typeof token.sessionExpiresAt === "number" ? token.sessionExpiresAt : undefined;
      if (exp !== undefined && Date.now() > exp) {
        return null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? "ADMIN";
        if (token.sub) session.user.id = token.sub;
      }
      // `authorized` (middleware/edge) bu alanı okuyup süresi geçmiş oturumu reddeder.
      if (typeof token.sessionExpiresAt === "number") {
        (session as { sessionExpiresAt?: number }).sessionExpiresAt = token.sessionExpiresAt;
      }
      return session;
    },
  },
};

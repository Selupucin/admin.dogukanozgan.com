// Auth.js (NextAuth v5) tip genişletmeleri — session/user'a `role` + `id` ekler.
// Kaynak: src/auth.ts (jwt/session callback'leri).

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
    /** Oturumun bitiş zamanı (ms epoch) — "Beni hatırla" + süre seçimi (docs/05). */
    sessionExpiresAt?: number;
  }

  interface User {
    role?: string;
    /** authorize → jwt: oturum ömrü (ms). jwt callback bunu sessionExpiresAt'e çevirir. */
    sessionMaxAgeMs?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    /** Oturum bitiş zamanı (ms epoch); süresi geçince jwt callback token'ı düşürür. */
    sessionExpiresAt?: number;
  }
}

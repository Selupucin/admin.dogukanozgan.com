// Auth.js (NextAuth v5) tip genişletmeleri — session/user'a `role` + `id` ekler.
// Kaynak: src/auth.ts (jwt/session callback'leri).

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

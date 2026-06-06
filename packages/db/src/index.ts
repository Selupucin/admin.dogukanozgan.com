// @do/db — paylaşımlı Prisma client.
// Hem apps/web (yazma) hem apps/admin (okuma/güncelleme) buradan import eder.
// Geliştirmede hot-reload sırasında birden çok client oluşmasını engellemek için
// global singleton kullanılır.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Prisma tarafından üretilen tipleri ve enum'ları yeniden dışa aktar.
export * from "@prisma/client";

// Supabase Storage (private bucket + imzalı URL) yardımcıları — YALNIZCA sunucu.
export * from "./storage";

// KVKK veri silme / anonimleştirme yardımcıları (Aşama 3 admin çağırır).
export * from "./kvkk";

// Admin kimlik doğrulama yardımcıları (şifre hash + Credentials doğrulama).
export * from "./auth";

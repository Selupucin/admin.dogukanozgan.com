// Basit in-memory rate limiter (IP başına sabit pencere).
// Kaynak: docs/06 §6 "Rate limiting (form spam + giriş denemeleri)".
//
// ⚠️ Bu uygulama TEK process belleğinde tutar; Vercel'de birden çok serverless
// instance olabileceğinden mutlak garanti değildir — temel spam caydırıcılığı içindir.
// TODO(doc): Üretimde dağıtık limit gerekiyorsa Upstash Redis / Supabase tablosu
// ile değiştirilebilir (env var ile feature-flag'lenebilir).

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Pencere başına izin verilen istek sayısı. */
  limit: number;
  /** Pencere süresi (ms). */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Sınır aşıldıysa kaç ms sonra tekrar denenebilir. */
  retryAfterMs: number;
}

/**
 * Verilen anahtar (genelde IP) için bir istek "harcar" ve sınır durumunu döner.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= opts.limit) {
    return { ok: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { ok: true, remaining: opts.limit - existing.count, retryAfterMs: 0 };
}

// Bellek sızıntısını önlemek için süresi geçmiş kovaları periyodik temizle.
// (Sadece uzun ömürlü process'lerde anlamlı; serverless'te zararsız.)
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (now >= bucket.resetAt) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  // Node sürecinin kapanmasını engellememesi için unref.
  (timer as unknown as { unref?: () => void }).unref?.();
}

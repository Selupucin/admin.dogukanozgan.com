// GEÇİCİ TANI UCU — yalnız env'lerin VARLIĞINI bildirir (DEĞER sızdırmaz).
// middleware matcher'ından hariç tutuldu (Edge secret hatası olsa bile erişilebilsin).
// TODO: tanı tamamlanınca bu route + middleware matcher istisnası kaldırılacak.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      authSecret: Boolean(process.env.AUTH_SECRET),
      nextauthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      authTrustHost: Boolean(process.env.AUTH_TRUST_HOST),
      resend: Boolean(process.env.RESEND_API_KEY),
      blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      db: Boolean(process.env.DATABASE_URL),
      nodeEnv: process.env.NODE_ENV ?? null,
    },
    { headers: { "x-robots-tag": "noindex, nofollow" } },
  );
}

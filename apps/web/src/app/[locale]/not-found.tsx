// 404 — Sayfa Bulunamadı ([locale] kapsamı). Next.js App Router not-found.tsx;
// bu rota [locale] layout içinde olduğundan SiteShell (header/footer/FAB) otomatik
// gelir. Tasarımla bütünleşik içerik: docs/09 palet (lacivert/teal/turuncu), Fraunces
// başlık, krem/kart zemin, yumuşak gölge, radyal ışıma. docs/02 (404 sayfası), docs/07
// (noindex / HTTP 404). next-intl not-found, request locale'i request.ts üzerinden çözer.
//
// SEO: not-found.tsx Next.js'te HTTP 404 statüsü döndürür ve sitemap'e EKLENMEZ.
// noindex burada metadata ile zorlanmaz çünkü not-found render'ında metadata export
// edilmez; ancak 404 statüsü arama motorlarının indekslememesi için yeterlidir.

import { getTranslations } from "next-intl/server";
import { Compass, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NotFoundActions } from "@/components/not-found-actions";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tc = await getTranslations("common");

  // Popüler bağlantılar (docs/02 404 — küçük yardımcı linkler). Statik kanonik yollar;
  // next-intl Link locale'e göre yerel yola otomatik çevirir.
  const popular = [
    { href: "/planlar" as const, label: t("linkPlans") },
    { href: "/iletisim" as const, label: tc("contact") },
    { href: "/sss" as const, label: t("linkFaq") },
  ];

  return (
    <main className="relative overflow-hidden">
      {/* Radyal ışıma (docs/09 — arka plan canlılığı). */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-44 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(16_88%_57%/0.14),transparent_65%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-44 top-40 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(177_60%_27%/0.14),transparent_65%)]"
      />

      <div className="relative mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28">
        {/* İnce çizgi ikon bloğu (docs/09 — lucide stroke ikon, teal rozet zemini). */}
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-accent text-accent-foreground shadow-sm">
          <Compass className="h-8 w-8" aria-hidden />
        </span>

        {/* Büyük "404" — Fraunces, akışkan ölçek. */}
        <p
          aria-hidden
          className="mt-8 font-heading text-[clamp(4.5rem,16vw,9rem)] font-semibold leading-none tracking-tight text-primary/90"
        >
          404
        </p>

        <span className="sr-only">404</span>

        <h1 className="mt-2 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-foreground">
          {t("heading")}
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t("body")}</p>

        {/* Geri dön + Anasayfaya dön butonları (client). */}
        <NotFoundActions />

        {/* Popüler bağlantılar (küçük linkler). */}
        <nav aria-label={t("popularLabel")} className="mt-12 w-full">
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
            {t("popularLabel")}
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
            {popular.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                  <ArrowRight
                    className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}

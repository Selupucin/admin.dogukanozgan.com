// Hakkımda — /[locale]/hakkimda (docs/02). Doğukan'ın tanıtımı, deneyim, neden ben?
// Zengin bölümler: hikâye/deneyim · çalışma yaklaşımı · değerler · branşlar · anlaşmalı
// şirketler · "nasıl çalışırım" süreci · istatistik/güven şeridi · kapanış CTA (docs/02/09).
// ⚠️ Gerçek biyografi bilgisi olmayan yerler MAKUL PLACEHOLDER (// TODO(doc) — Doğukan verecek).
// SEO: tekil title/meta + hreflang/canonical (docs/07).

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ShieldCheck, Scale, Clock, HeartHandshake } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/seo";
import { getAllProducts, getLocalizedSlug } from "@do/products";
import { ProductIcon } from "@/components/product-icon";
import { partnerCompanies } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates(locale as Locale, "/hakkimda"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("about");
  const tc = await getTranslations("common");
  const th = await getTranslations("home");
  const products = getAllProducts();

  const values = [
    { icon: Scale, title: t("v1Title"), body: t("v1Body") },
    { icon: ShieldCheck, title: t("v2Title"), body: t("v2Body") },
    { icon: Clock, title: t("v3Title"), body: t("v3Body") },
    { icon: HeartHandshake, title: t("v4Title"), body: t("v4Body") },
  ];

  const stats = [
    { value: t("stats.companies"), label: t("stats.companiesLabel") },
    { value: t("stats.branches"), label: t("stats.branchesLabel") },
    { value: t("stats.independent"), label: t("stats.independentLabel") },
  ];

  // "Nasıl çalışırım" süreci — home.steps ile aynı kaynak (tutarlı anlatım).
  const steps = [
    { t: th("steps.s1Title"), d: th("steps.s1Body") },
    { t: th("steps.s2Title"), d: th("steps.s2Body") },
    { t: th("steps.s3Title"), d: th("steps.s3Body") },
  ];

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-36 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(177_60%_27%/0.16),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
          <span className="text-xs font-extrabold uppercase tracking-[0.1em] eyebrow">
            {t("eyebrow")}
          </span>
          <h1 className="mt-3 font-heading text-[clamp(2.2rem,4.5vw,3.2rem)] font-semibold tracking-tight text-foreground">
            {t("heading")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("intro")}</p>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-heading text-3xl leading-none text-foreground">{s.value}</dd>
                <span className="text-sm font-semibold text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== HİKÂYE / DENEYİM ===== */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl text-foreground">{t("storyLabel")}</h2>
          <div className="prose prose-neutral mt-5 max-w-none text-foreground dark:prose-invert">
            <p>{t("story1")}</p>
            <p>{t("story2")}</p>
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p>{t("p3")}</p>
          </div>
        </div>
      </section>

      {/* ===== ÇALIŞMA YAKLAŞIMI ===== */}
      <section className="bg-muted/60 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl text-foreground">{t("approachLabel")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("approachBody")}</p>
        </div>
      </section>

      {/* ===== DEĞERLER ===== */}
      <section aria-label={t("valuesLabel")} className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl text-foreground">{t("valuesLabel")}</h2>
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <li
                key={v.title}
                className="flex gap-4 rounded-[var(--radius)] border border-border bg-card p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <v.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-heading text-lg text-foreground">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== BRANŞLAR ===== */}
      <section className="bg-muted/60 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl text-foreground">{t("branchesLabel")}</h2>
          <p className="mt-3 text-muted-foreground">{t("branchesBody")}</p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  href={{
                    pathname: "/planlar/[slug]",
                    params: { slug: getLocalizedSlug(p, loc) },
                  }}
                  className="group flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <ProductIcon name={p.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{p.name[loc]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== NASIL ÇALIŞIRIM (SÜREÇ) ===== */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl text-foreground">{t("processLabel")}</h2>
          <ol className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={i}>
                <span className="font-heading text-5xl font-semibold leading-none text-destructive">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-heading text-lg text-foreground">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== ANLAŞMALI ŞİRKETLER (GÜVEN ŞERİDİ) ===== */}
      <section aria-label={t("companiesLabel")} className="bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold">{t("companiesLabel")}</h2>
          <p className="mt-2 text-sm text-background/70">{t("companiesBody")}</p>
          <ul className="mt-7 flex flex-wrap gap-3">
            {partnerCompanies.map((c) => (
              <li
                key={c}
                className="rounded-lg border border-white/12 bg-white/[0.07] px-4 py-2 text-sm font-bold text-background/90"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== KAPANIŞ CTA ===== */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl text-foreground">{t("ctaTitle")}</h2>
          <div className="mt-6 flex flex-wrap gap-3.5">
            <Link
              href="/planlar"
              className="inline-flex items-center gap-2 rounded-full bg-destructive px-6 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[hsl(9_84%_38%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {tc("getQuote")}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-foreground px-6 py-3 text-base font-bold text-foreground transition hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {tc("contact")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

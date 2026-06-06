"use client";

// Geri arama / iletişim formu (docs/02 "İletişim: ... genel form").
// NOT: Ürün teklif formları backend-engineer'ın Server Action'ına bağlanır ve KVKK
// rıza akışını içerir. Bu sayfadaki GENEL iletişim formu ise hafif bir "geri arama"
// kanalıdır: girilen bilgiler WhatsApp mesajına dönüştürülür ve doğrudan iletilir —
// böylece backend mantığı uydurulmadan çalışan bir iletişim yolu sağlanır.
// TODO(doc): İstenirse bu form için ayrı bir Server Action (e-posta/CRM) eklenebilir.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { contact } from "@/lib/site";

export function ContactForm() {
  const t = useTranslations("contact");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function buildWaHref() {
    const lines = [
      `${t("formName")}: ${name}`.trim(),
      `${t("formPhone")}: ${phone}`.trim(),
      email ? `${t("formEmail")}: ${email}` : "",
      subject ? `${t("formSubject")}: ${subject}` : "",
      message ? `${t("formMessage")}: ${message}` : "",
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${contact.whatsapp}?text=${text}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.open(buildWaHref(), "_blank", "noopener,noreferrer");
  }

  const fieldClass =
    "w-full rounded-xl border-[1.5px] border-input bg-background px-4 py-3 text-base text-foreground transition focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/15";
  const labelClass = "mb-1.5 block text-sm font-bold text-muted-foreground";

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-6 sm:p-8">
      <h2 className="font-heading text-xl text-foreground">{t("formTitle")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("formIntro")}</p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cf-name" className={labelClass}>
              {t("formName")} *
            </label>
            <input
              id="cf-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("formNamePlaceholder")}
              className={fieldClass}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="cf-phone" className={labelClass}>
              {t("formPhone")} *
            </label>
            <input
              id="cf-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("formPhonePlaceholder")}
              className={fieldClass}
              autoComplete="tel"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cf-email" className={labelClass}>
            {t("formEmail")}
          </label>
          <input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("formEmailPlaceholder")}
            className={fieldClass}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="cf-subject" className={labelClass}>
            {t("formSubject")}
          </label>
          <input
            id="cf-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("formSubjectPlaceholder")}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cf-message" className={labelClass}>
            {t("formMessage")}
          </label>
          <textarea
            id="cf-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("formMessagePlaceholder")}
            className={`${fieldClass} resize-y`}
          />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{t("formWhatsappHint")}</p>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {t("formSubmit")}
        </button>
        <p className="text-center text-xs text-muted-foreground">{t("formNote")}</p>
      </form>
    </div>
  );
}

// @do/email — Ortak marka düzeni (React Email).
// docs/09: lacivert başlık şeridi + "Doğukan Özgan" wordmark ("Özgan" turuncu),
// krem/beyaz gövde, footer (iletişim + kısa KVKK notu).
// E-posta-güvenli: tüm stiller INLINE, açık zemin / koyu metin, mobil uyumlu.

import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { palette, fonts, contact } from "../lib/theme";
import { layoutStrings, type Locale } from "../lib/i18n";

export interface EmailLayoutProps {
  /** <head> önizleme (gelen kutusu özet satırı). */
  preview: string;
  locale: Locale;
  children: React.ReactNode;
}

export function EmailLayout({ preview, locale, children }: EmailLayoutProps) {
  const t = layoutStrings[locale];
  const year = new Date().getFullYear();

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Lacivert başlık şeridi + wordmark */}
          <Section style={header}>
            <Text style={wordmark}>
              Doğukan <span style={wordmarkAccent}>Özgan</span>
            </Text>
            <Text style={tagline}>Sigorta Acentesi</Text>
          </Section>

          {/* Gövde (krem/beyaz kart) */}
          <Section style={content}>{children}</Section>

          {/* Footer: iletişim + kısa KVKK notu */}
          <Section style={footer}>
            <Text style={footerBrand}>{contact.brand}</Text>
            <Text style={footerLine}>
              {t.contactLabel}:{" "}
              <Link href={contact.phoneHref} style={footerLink}>
                {contact.phone}
              </Link>{" "}
              ·{" "}
              <Link href={`mailto:${contact.email}`} style={footerLink}>
                {contact.email}
              </Link>
            </Text>
            <Text style={footerLine}>{contact.address}</Text>
            <Hr style={footerHr} />
            <Text style={footerKvkk}>{t.kvkk}</Text>
            <Text style={footerRights}>
              © {year} {contact.brand}. {t.rights}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ---------- E-posta-güvenli inline stiller ---------- */

const body: React.CSSProperties = {
  backgroundColor: palette.cream,
  margin: 0,
  padding: "24px 0",
  fontFamily: fonts.body,
  color: palette.inkSoft,
  WebkitTextSizeAdjust: "100%",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  width: "100%",
  margin: "0 auto",
  backgroundColor: palette.paper,
  borderRadius: "14px",
  overflow: "hidden",
  border: `1px solid ${palette.creamDeep}`,
};

const header: React.CSSProperties = {
  backgroundColor: palette.navy,
  padding: "28px 32px",
  textAlign: "center",
};

const wordmark: React.CSSProperties = {
  margin: 0,
  fontFamily: fonts.heading,
  fontSize: "26px",
  fontWeight: 700,
  color: palette.white,
  letterSpacing: "0.2px",
  lineHeight: "1.2",
};

const wordmarkAccent: React.CSSProperties = {
  color: palette.orange,
};

const tagline: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "12px",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#9fb0c2",
};

const content: React.CSSProperties = {
  padding: "32px",
  backgroundColor: palette.paper,
};

const footer: React.CSSProperties = {
  padding: "24px 32px 28px",
  backgroundColor: palette.cream,
  borderTop: `1px solid ${palette.creamDeep}`,
};

const footerBrand: React.CSSProperties = {
  margin: "0 0 8px",
  fontFamily: fonts.heading,
  fontSize: "15px",
  fontWeight: 700,
  color: palette.navy,
};

const footerLine: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "13px",
  color: palette.inkSoft,
  lineHeight: "1.5",
};

const footerLink: React.CSSProperties = {
  color: palette.teal,
  textDecoration: "none",
};

const footerHr: React.CSSProperties = {
  borderColor: palette.creamDeep,
  margin: "16px 0",
};

const footerKvkk: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "11px",
  color: "#7c8a99",
  lineHeight: "1.5",
};

const footerRights: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  color: "#7c8a99",
};

/* Şablonlarda yeniden kullanılan ortak gövde stilleri (dışa aktarılır). */
export const sharedStyles = {
  greeting: {
    margin: "0 0 12px",
    fontSize: "16px",
    color: palette.navy,
    fontWeight: 600,
  } as React.CSSProperties,
  paragraph: {
    margin: "0 0 16px",
    fontSize: "15px",
    lineHeight: "1.6",
    color: palette.inkSoft,
  } as React.CSSProperties,
  heading: {
    margin: "0 0 16px",
    fontFamily: fonts.heading,
    fontSize: "22px",
    fontWeight: 700,
    color: palette.navy,
    lineHeight: "1.3",
  } as React.CSSProperties,
  button: {
    display: "inline-block",
    backgroundColor: palette.orange,
    color: palette.white,
    fontSize: "15px",
    fontWeight: 700,
    textDecoration: "none",
    padding: "13px 28px",
    borderRadius: "999px",
  } as React.CSSProperties,
  signature: {
    margin: "24px 0 0",
    fontSize: "15px",
    color: palette.navy,
    fontWeight: 600,
  } as React.CSSProperties,
  promo: {
    margin: "20px 0 0",
    padding: "14px 16px",
    backgroundColor: palette.tealSoft,
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.5",
    color: palette.teal,
  } as React.CSSProperties,
};

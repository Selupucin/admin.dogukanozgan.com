// @do/email — "Teklif Alındı" şablonu (müşteriye). K28 / docs/12 §2.
// İçerik: teşekkür + ürün + büyük/belirgin durum-takip KODU + "Durumu Sorgula"
// butonu (statusUrl) + tahmini dönüş süresi (placeholder) + iletişim (footer) +
// ölçülü tanıtım. KVKK: hassas/özel nitelikli veri KOYULMAZ (docs/06).

import * as React from "react";
import { Button, Link, Section, Text } from "@react-email/components";
import { EmailLayout, sharedStyles } from "./EmailLayout";
import { palette, fonts } from "../lib/theme";
import { quoteReceivedStrings, type Locale } from "../lib/i18n";

export interface QuoteReceivedEmailProps {
  /** Ürün adı (görünen). */
  productName: string;
  /** Durum-takip kodu (K30 trackingCode). */
  code: string;
  /** Durum sorgu sayfası tam URL'i (locale dahil). */
  statusUrl: string;
  locale: Locale;
}

export function QuoteReceivedEmail({
  productName,
  code,
  statusUrl,
  locale,
}: QuoteReceivedEmailProps) {
  const t = quoteReceivedStrings[locale];

  return (
    <EmailLayout preview={t.preview} locale={locale}>
      <Text style={sharedStyles.greeting}>{t.greeting}</Text>
      <Text style={sharedStyles.heading}>{t.intro(productName)}</Text>
      <Text style={sharedStyles.paragraph}>{t.turnaround}</Text>

      {/* Durum-takip kodu — büyük ve belirgin */}
      <Section style={codeBox}>
        <Text style={codeLabel}>{t.codeLabel}</Text>
        <Text style={codeValue}>{code}</Text>
      </Section>

      <Text style={sharedStyles.paragraph}>{t.statusHint}</Text>

      {/* Durumu Sorgula butonu */}
      <Section style={{ textAlign: "center", margin: "8px 0 4px" }}>
        <Button href={statusUrl} style={sharedStyles.button}>
          {t.statusCta}
        </Button>
      </Section>
      <Text style={fallbackLink}>
        <Link href={statusUrl} style={{ color: palette.teal }}>
          {statusUrl}
        </Link>
      </Text>

      {/* Ölçülü tanıtım — amaçtan sapmadan (docs/12 madde 8) */}
      <Text style={sharedStyles.promo}>{t.promo}</Text>

      <Text style={sharedStyles.signature}>
        {t.closing}
        <br />
        {t.signature}
      </Text>
    </EmailLayout>
  );
}

const codeBox: React.CSSProperties = {
  margin: "8px 0 20px",
  padding: "20px",
  backgroundColor: palette.cream,
  border: `2px dashed ${palette.orange}`,
  borderRadius: "12px",
  textAlign: "center",
};

const codeLabel: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "12px",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: palette.inkSoft,
};

const codeValue: React.CSSProperties = {
  margin: 0,
  fontFamily: fonts.heading,
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "4px",
  color: palette.navy,
};

const fallbackLink: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  textAlign: "center",
  wordBreak: "break-all",
  color: palette.inkSoft,
};

export default QuoteReceivedEmail;

// @do/email — "Poliçe Teslim" şablonu (müşteriye). K28 / docs/12 §2.
// İçerik: poliçeniz hazır + poliçe belgesi linki (policyUrl) + kısa özet +
// iletişim (footer) + profesyonel kapanış. KVKK: belge YALNIZCA ilgili müşteriye;
// e-postaya özel nitelikli veri KOYULMAZ (docs/06).

import * as React from "react";
import { Button, Link, Section, Text } from "@react-email/components";
import { EmailLayout, sharedStyles } from "./EmailLayout";
import { palette } from "../lib/theme";
import { policyDeliveryStrings, type Locale } from "../lib/i18n";

export interface PolicyDeliveryEmailProps {
  /** Ürün adı (görünen). */
  productName: string;
  /** Poliçe belgesi tam URL'i (imzalı/erişim-kontrollü link). */
  policyUrl: string;
  locale: Locale;
}

export function PolicyDeliveryEmail({ productName, policyUrl, locale }: PolicyDeliveryEmailProps) {
  const t = policyDeliveryStrings[locale];

  return (
    <EmailLayout preview={t.preview} locale={locale}>
      <Text style={sharedStyles.greeting}>{t.greeting}</Text>
      <Text style={sharedStyles.heading}>{t.intro(productName)}</Text>

      {/* Kısa özet */}
      <Section style={summaryBox}>
        <Text style={summaryLabel}>{t.summaryLabel}</Text>
        <Text style={summaryValue}>{productName}</Text>
      </Section>

      <Text style={sharedStyles.paragraph}>{t.documentHint}</Text>

      {/* Poliçe belgesi butonu */}
      <Section style={{ textAlign: "center", margin: "8px 0 4px" }}>
        <Button href={policyUrl} style={sharedStyles.button}>
          {t.documentCta}
        </Button>
      </Section>
      <Text style={fallbackLink}>
        <Link href={policyUrl} style={{ color: palette.teal }}>
          {policyUrl}
        </Link>
      </Text>

      <Text style={sharedStyles.paragraph}>{t.support}</Text>

      <Text style={sharedStyles.signature}>
        {t.closing}
        <br />
        {t.signature}
      </Text>
    </EmailLayout>
  );
}

const summaryBox: React.CSSProperties = {
  margin: "8px 0 20px",
  padding: "16px 20px",
  backgroundColor: palette.tealSoft,
  borderRadius: "12px",
};

const summaryLabel: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "12px",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: palette.teal,
};

const summaryValue: React.CSSProperties = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 700,
  color: palette.navy,
};

const fallbackLink: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  textAlign: "center",
  wordBreak: "break-all",
  color: palette.inkSoft,
};

export default PolicyDeliveryEmail;

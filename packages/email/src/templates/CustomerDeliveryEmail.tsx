// @do/email — "Müşteri Teslim" şablonu (genel). K28 / docs/12 §2.
// İki tür (kind): "teklif" → "Teklifiniz hazırlandı", "police" → "Poliçeniz hazır".
// Opsiyoneller: serbest mesaj (admin notu), ek dosya bildirimi, durum linki.
// İçerik (ek + mesaj) YOKSA standart "hazırlandı / iletişime geçeceğiz" metni gösterilir.
//
// NOT: Ek dosya body'de GÖSTERİLMEZ; e-postaya gerçek ek olarak send.ts iliştirir.
// Body yalnızca "ekte gönderildi" bilgisini verir (hasAttachment true ise).
//
// GÜVENLİK/KVKK: `message` admin tarafından girilir; React Email JSX metni otomatik
// kaçışlar (XSS yok). E-postaya özel nitelikli veri KOYULMAZ (docs/06); ek olarak
// giden belge veri sahibinin KENDİ teklif/poliçe belgesidir.

import * as React from "react";
import { Button, Link, Section, Text } from "@react-email/components";
import { EmailLayout, sharedStyles } from "./EmailLayout";
import { palette } from "../lib/theme";
import { customerDeliveryStrings, type DeliveryKind, type Locale } from "../lib/i18n";

export interface CustomerDeliveryEmailProps {
  /** Teslim türü — başlık/metin varyantını belirler. */
  kind: DeliveryKind;
  /** Ürün adı (görünen). */
  productName: string;
  /** Admin'in girdiği serbest mesaj (opsiyonel). Varsa "Acentenizden not" bloğunda. */
  message?: string;
  /** E-postaya ek dosya iliştirildi mi? (body'de "ekte gönderildi" bilgisi için.) */
  hasAttachment?: boolean;
  /** Durum sorgu/görüntüleme sayfası tam URL'i (opsiyonel). */
  statusUrl?: string;
  locale: Locale;
}

export function CustomerDeliveryEmail({
  kind,
  productName,
  message,
  hasAttachment,
  statusUrl,
  locale,
}: CustomerDeliveryEmailProps) {
  const t = customerDeliveryStrings[locale];
  const trimmedMessage = message?.trim();
  const hasMessage = Boolean(trimmedMessage);
  // İçerik yoksa standart "hazırlandı" gövdesi gösterilir.
  const hasContent = Boolean(hasAttachment) || hasMessage;

  return (
    <EmailLayout preview={t.preview(kind)} locale={locale}>
      <Text style={sharedStyles.greeting}>{t.greeting}</Text>
      <Text style={sharedStyles.heading}>{t.intro(kind, productName)}</Text>

      {/* Kısa özet — ürün */}
      <Section style={summaryBox}>
        <Text style={summaryLabel}>{t.summaryLabel(kind)}</Text>
        <Text style={summaryValue}>{productName}</Text>
      </Section>

      {/* İçerik yoksa: standart bilgilendirme metni */}
      {!hasContent && <Text style={sharedStyles.paragraph}>{t.standardBody(kind)}</Text>}

      {/* Ek dosya iliştirildiyse: yalnız bilgi metni (dosya body'de gösterilmez) */}
      {hasAttachment && (
        <Section style={attachmentBox}>
          <Text style={attachmentText}>{t.attachmentNotice(kind)}</Text>
        </Section>
      )}

      {/* Admin'in serbest mesajı (varsa) — otomatik kaçışlı, güvenli */}
      {hasMessage && (
        <Section style={messageBox}>
          <Text style={messageLabel}>{t.messageLabel}</Text>
          <Text style={messageText}>{trimmedMessage}</Text>
        </Section>
      )}

      {/* Durum linki (opsiyonel) */}
      {statusUrl && (
        <>
          <Text style={sharedStyles.paragraph}>{t.statusHint}</Text>
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
        </>
      )}

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

const attachmentBox: React.CSSProperties = {
  margin: "0 0 16px",
  padding: "14px 18px",
  backgroundColor: palette.cream,
  border: `1px solid ${palette.creamDeep}`,
  borderRadius: "10px",
};

const attachmentText: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  lineHeight: "1.5",
  color: palette.inkSoft,
};

const messageBox: React.CSSProperties = {
  margin: "0 0 20px",
  padding: "16px 20px",
  backgroundColor: palette.paper,
  borderLeft: `4px solid ${palette.orange}`,
  borderRadius: "8px",
};

const messageLabel: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "12px",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: palette.orange,
  fontWeight: 700,
};

const messageText: React.CSSProperties = {
  margin: 0,
  fontSize: "15px",
  lineHeight: "1.6",
  color: palette.inkSoft,
  whiteSpace: "pre-wrap",
};

const fallbackLink: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  textAlign: "center",
  wordBreak: "break-all",
  color: palette.inkSoft,
};

export default CustomerDeliveryEmail;

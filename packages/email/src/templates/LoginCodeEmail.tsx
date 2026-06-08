// @do/email — "Admin Giriş Doğrulama Kodu" (OTP / 2FA) şablonu. K28 / docs/12 §2.
// İçerik: büyük, okunaklı, monospace 6 haneli KOD (kopyalanabilir) + geçerlilik
// süresi + güvenlik notu ("siz yapmadıysanız şifrenizi değiştirin"). Sade, net,
// transactional. Marka başlık/footer EmailLayout'tan gelir.
//
// NOT: Kod ÇAĞRI sırasında verilir (admin tarafı üretir/saklar); bu şablon yalnız
// gösterir. Hassas veri içermez (docs/06).

import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout, sharedStyles } from "./EmailLayout";
import { palette, fonts } from "../lib/theme";
import { loginCodeStrings, type Locale } from "../lib/i18n";

export interface LoginCodeEmailProps {
  /** Doğrulama kodu (admin tarafı üretir; örn. 6 haneli). */
  code: string;
  /** Kodun geçerlilik süresi (dakika). */
  expiresMinutes: number;
  locale: Locale;
}

export function LoginCodeEmail({ code, expiresMinutes, locale }: LoginCodeEmailProps) {
  const t = loginCodeStrings[locale];

  return (
    <EmailLayout preview={t.preview} locale={locale}>
      <Text style={sharedStyles.greeting}>{t.greeting}</Text>
      <Text style={sharedStyles.heading}>{t.intro}</Text>

      {/* Doğrulama kodu — büyük, monospace, kopyalanabilir */}
      <Section style={codeBox}>
        <Text style={codeLabel}>{t.codeLabel}</Text>
        <Text style={codeValue}>{code}</Text>
      </Section>

      <Text style={sharedStyles.paragraph}>{t.expiry(expiresMinutes)}</Text>

      {/* Güvenlik notu — ölçülü, dikkat çekici */}
      <Section style={securityBox}>
        <Text style={securityText}>{t.securityNotice}</Text>
      </Section>

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
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  fontSize: "38px",
  fontWeight: 700,
  letterSpacing: "8px",
  color: palette.navy,
  // Kullanıcı kodu kolayca seçip kopyalayabilsin.
  userSelect: "all",
};

const securityBox: React.CSSProperties = {
  margin: "4px 0 0",
  padding: "14px 16px",
  backgroundColor: palette.cream,
  borderLeft: `4px solid ${palette.orange}`,
  borderRadius: "8px",
};

const securityText: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  lineHeight: "1.6",
  color: palette.inkSoft,
};

export default LoginCodeEmail;

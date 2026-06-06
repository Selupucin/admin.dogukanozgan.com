// Favicon — wordmark "DÖ"den türetilir (docs/09 "Header, footer ve favicon bu
// wordmark/baş harf 'DÖ' üzerinden türetilir"). ImageResponse ile dinamik üretim.
// Palet: lacivert zemin + turuncu harf (docs/09 renk paleti).

import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#10243a",
        borderRadius: 14,
        color: "#f25a32",
        fontSize: 34,
        fontWeight: 700,
        fontFamily: "Georgia, 'Times New Roman', serif",
        letterSpacing: -1,
      }}
    >
      DÖ
    </div>,
    { ...size },
  );
}

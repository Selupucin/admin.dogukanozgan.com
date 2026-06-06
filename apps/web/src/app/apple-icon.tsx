// Apple touch icon — "DÖ" wordmark baş harfi (docs/09).

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#10243a",
        color: "#f25a32",
        fontSize: 96,
        fontWeight: 700,
        fontFamily: "Georgia, 'Times New Roman', serif",
        letterSpacing: -2,
      }}
    >
      DÖ
    </div>,
    { ...size },
  );
}

import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

// Shared mark used for the PWA manifest icons (192, 512, and the maskable
// 512 variant). `safeZonePercent` shrinks the glyph so Android's adaptive-
// icon mask has room to crop into a circle/squircle without clipping it —
// see https://web.dev/articles/maskable-icon.
export function pwaIcon(pixels: number, safeZonePercent = 1) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.deep,
        }}
      >
        <div
          style={{
            width: `${safeZonePercent * 100}%`,
            height: `${safeZonePercent * 100}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: BRAND.goldSoft,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: pixels * 0.6 * safeZonePercent,
          }}
        >
          L
        </div>
      </div>
    ),
    { width: pixels, height: pixels }
  );
}

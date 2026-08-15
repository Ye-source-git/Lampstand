import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

// iOS applies its own rounded-corner mask to this automatically — no need
// to round it here.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: BRAND.goldSoft,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: 110,
        }}
      >
        L
      </div>
    ),
    size
  );
}

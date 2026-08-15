import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
        }}
      >
        L
      </div>
    ),
    size
  );
}

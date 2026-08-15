import { pwaIcon } from "@/lib/pwaIcon";

export function GET() {
  // Confines the glyph to the central ~60% so it survives Android's
  // adaptive-icon masking (circle, squircle, etc.) without clipping.
  return pwaIcon(512, 0.6);
}

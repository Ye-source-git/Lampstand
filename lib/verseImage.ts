import { BRAND } from "@/lib/constants";

// Shared image export used for sharing a verse (Today's daily verse, or any verse
// selected in Read). Always renders with fixed brand colors regardless of the
// viewer's light/dark theme, since a shared image should look the same for everyone
// who sees it, not just the person who exported it.

const SIZE = 1080;

async function ensureFontsLoaded() {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await Promise.all([
      document.fonts.load("600 60px Fraunces"),
      document.fonts.load("700 34px Fraunces"),
      document.fonts.load("600 32px 'Albert Sans'"),
    ]);
  } catch {
    // Webfonts may not be ready yet — canvas falls back to a default serif/sans-serif.
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export type VerseImageInput = {
  reference: string;
  text: string;
  translationName: string;
};

export async function generateVerseImage({ reference, text, translationName }: VerseImageInput): Promise<Blob> {
  await ensureFontsLoaded();

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = BRAND.deep;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const marginX = 96;
  const maxWidth = SIZE - marginX * 2;
  const maxTextHeight = 620;

  let fontSize = 60;
  let lines: string[] = [];
  let lineHeight = 0;
  while (fontSize >= 28) {
    ctx.font = `600 ${fontSize}px Fraunces, Georgia, serif`;
    lines = wrapText(ctx, `“${text}”`, maxWidth);
    lineHeight = fontSize * 1.35;
    if (lines.length * lineHeight <= maxTextHeight || fontSize === 28) break;
    fontSize -= 2;
  }

  ctx.fillStyle = BRAND.white;
  ctx.textBaseline = "alphabetic";
  const textBlockHeight = lines.length * lineHeight;
  let y = (SIZE - textBlockHeight) / 2 - 40;
  for (const line of lines) {
    ctx.fillText(line, marginX, y + fontSize);
    y += lineHeight;
  }

  ctx.font = "600 32px 'Albert Sans', sans-serif";
  ctx.fillStyle = BRAND.goldSoft;
  ctx.fillText(`${reference} · ${translationName}`, marginX, y + 56);

  ctx.font = "700 34px Fraunces, Georgia, serif";
  ctx.fillStyle = BRAND.gold;
  ctx.fillText("Lampstand", marginX, SIZE - 80);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not generate image"));
    }, "image/png");
  });
}

export async function shareOrDownloadVerseImage(input: VerseImageInput) {
  const blob = await generateVerseImage(input);
  const filename = `lampstand-${input.reference.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.png`;
  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: input.reference, text: `${input.reference} — Lampstand` });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      // fall through to download if sharing failed for any other reason
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

"use client";

import { useState } from "react";
import { shareOrDownloadVerseImage, type VerseImageInput } from "@/lib/verseImage";

export function ShareVerseButton({
  reference,
  text,
  translationName,
  className,
  style,
  children,
}: VerseImageInput & {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      await shareOrDownloadVerseImage({ reference, text, translationName });
    } catch {
      // Image generation/sharing isn't critical path — fail quietly rather than
      // interrupt reading with an error for what's a bonus feature.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={busy} className={className} style={style}>
      {busy ? "Preparing…" : children}
    </button>
  );
}

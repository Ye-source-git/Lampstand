import { Suspense } from "react";
import { ReadClient } from "@/components/read/ReadClient";
import { C } from "@/lib/constants";

export default function ReadPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          Turning the pages…
        </p>
      }
    >
      <ReadClient />
    </Suspense>
  );
}

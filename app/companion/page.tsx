import { Suspense } from "react";
import { CompanionClient } from "@/components/companion/CompanionClient";

export default function CompanionPage() {
  return (
    <Suspense fallback={null}>
      <CompanionClient />
    </Suspense>
  );
}

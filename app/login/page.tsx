import { Suspense } from "react";
import { LoginClient } from "@/components/auth/LoginClient";
import { C } from "@/lib/constants";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm italic" style={{ color: C.inkSoft, fontFamily: "'Lora', serif" }}>
          Loading…
        </p>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

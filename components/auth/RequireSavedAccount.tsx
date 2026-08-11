"use client";

import { useRouter } from "next/navigation";
import { C } from "@/lib/constants";
import { GoldButton } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthProvider";

// Tables are the one part of the app that requires a saved (non-anonymous)
// account — membership needs to survive a device switch or cleared cookies,
// which an anonymous session can't promise. Everything else in Longtable
// stays anonymous-friendly.
export function RequireSavedAccount({ next, children }: { next: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user || user.is_anonymous) {
    return (
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p className="mb-4 text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
          Tables are shared with people you invite, so we ask you to save your account first — that way you keep
          your seat even if you switch devices or clear your browser.
        </p>
        <GoldButton onClick={() => router.push(`/login?reason=table&next=${encodeURIComponent(next)}`)}>
          Save your account
        </GoldButton>
      </div>
    );
  }

  return <>{children}</>;
}

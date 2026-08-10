"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { C } from "@/lib/constants";
import { GoldButton, QuietButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export function LoginClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isAnonymous = user?.is_anonymous ?? false;
  const next = searchParams.get("next") || "/";
  const forTable = searchParams.get("reason") === "table";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink() {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    // An anonymous session gets *upgraded* in place (same user_id, so existing
    // highlights/journal/plan progress carry over) rather than starting a fresh
    // sign-in, which would otherwise leave that data behind under the old identity.
    const { error } = isAnonymous
      ? await supabase.auth.updateUser({ email: email.trim() }, { emailRedirectTo: redirectTo })
      : await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: redirectTo },
        });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    const options = { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` };
    if (isAnonymous) {
      await supabase.auth.linkIdentity({ provider: "google", options });
    } else {
      await supabase.auth.signInWithOAuth({ provider: "google", options });
    }
  }

  if (user && !isAnonymous) {
    return (
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: "'Lora', serif", color: C.ink }}>You’re signed in as {user.email}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        {isAnonymous ? "Save your progress." : "Welcome back."}
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        {isAnonymous
          ? forTable
            ? "Tables are shared with people you invite, so we ask you to save your account first — that way you keep your seat at the table even if you switch devices or clear your browser."
            : "You can already use Lampstand fully without an account. Add an email or Google account to keep your highlights, notes, and progress if you switch devices or clear your browser."
          : "Sign in to keep your highlights, notes, and progress across devices."}
      </p>

      {sent ? (
        <p className="text-sm" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
          {isAnonymous
            ? "Check your email for a confirmation link to finish saving your account."
            : "Check your email for a sign-in link."}
        </p>
      ) : (
        <>
          <label className="block text-xs font-semibold mb-1" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMagicLink()}
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none"
            style={{ fontFamily: "'Albert Sans', sans-serif", background: C.white, border: `1px solid ${C.border}`, color: C.ink }}
          />
          <GoldButton onClick={sendMagicLink} disabled={busy || !email.trim()}>
            {busy ? "Sending…" : isAnonymous ? "Save with email" : "Send magic link"}
          </GoldButton>

          {error && <p className="mt-3 text-sm" style={{ color: "#8A3B2E", fontFamily: "'Albert Sans', sans-serif" }}>{error}</p>}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: C.border }} />
            <span className="text-xs" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>or</span>
            <div className="flex-1 h-px" style={{ background: C.border }} />
          </div>

          <QuietButton onClick={signInWithGoogle}>Continue with Google</QuietButton>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { C } from "@/lib/constants";
import { GoldButton, QuietButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink() {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (user) {
    return (
      <div className="rounded-2xl px-6 py-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: "'Lora', serif", color: C.ink }}>You’re signed in as {user.email}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.ink }} className="mb-2">
        Welcome back.
      </h2>
      <p className="text-sm mb-6" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
        Sign in to save highlights, notes, plan progress, and use the Companion and Study Guide.
      </p>

      {sent ? (
        <p className="text-sm" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
          Check your email for a sign-in link.
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
            {busy ? "Sending…" : "Send magic link"}
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

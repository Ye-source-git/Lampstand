import { C } from "@/lib/constants";

export const metadata = { title: "Privacy Policy — Longtable" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.ink }} className="mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed" style={{ fontFamily: "'Lora', serif", color: C.ink }}>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, color: C.ink }} className="mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm mb-10" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
        Last updated August 2026
      </p>

      <Section title="Who we are">
        <p>
          Longtable (longtable.study) is a free, non-commercial Bible study project. It is currently operated by
          an individual, not a registered company or nonprofit corporation. This policy explains what information
          Longtable collects, why, and what you can do about it.
        </p>
      </Section>

      <Section title="You can use Longtable without an account">
        <p>
          Longtable works fully anonymously by default — reading, search, highlights, notes, plans, and the Study
          Companion don&rsquo;t require an email address. An anonymous session is created automatically on your
          device so your activity can be saved as you use the app, without asking you for any personal information.
        </p>
        <p>
          If you choose to &ldquo;save your account&rdquo; with an email address or Google sign-in, that identity is
          linked to your existing anonymous session — the same data, now recoverable if you switch devices or clear
          your browser.
        </p>
      </Section>

      <Section title="What we collect">
        <p>If you choose to save an account: the email address you provide, or basic profile info (name, email) from Google if you sign in that way.</p>
        <p>
          Content you create while using Longtable: verse highlights and personal notes, journal entries, reading
          plan progress, prayer requests and comments you post to a Table, and verse discussion comments. This is
          the core of what the app stores, and most of it is private to you by default (see &ldquo;Tables and
          sharing&rdquo; below for the exception).
        </p>
        <p>
          Standard technical data collected automatically by our hosting providers (like IP address and request
          logs) as a normal part of running a website — we don&rsquo;t use this for tracking or advertising.
        </p>
        <p>
          <strong>We do not currently use any third-party analytics or advertising trackers.</strong> If that ever
          changes, we&rsquo;ll update this policy first.
        </p>
      </Section>

      <Section title="Tables and sharing">
        <p>
          Tables are small, invite-only groups you create or join with people you invite. Anything you post to a
          Table — a prayer request, a shared reflection, a verse discussion comment — is visible to the other
          members of that specific Table, and to no one else. Nothing you do in Longtable is ever public by
          default; sharing with a Table is always something you choose, one piece of content at a time.
        </p>
        <p>
          Because Tables require a saved (non-anonymous) account — so you don&rsquo;t lose your seat at the table if
          you switch devices — joining or creating a Table means your account is no longer anonymous-only.
        </p>
      </Section>

      <Section title="The Study Companion and AI features">
        <p>
          When you ask the Study Companion a question or generate a Study Guide, your question and relevant Bible
          text are sent to Anthropic (the maker of Claude, the AI model we use) to generate a response. We do not
          store the content of these conversations ourselves — only a daily count of how many questions you&rsquo;ve
          asked, to keep the feature sustainable and prevent abuse. Anthropic&rsquo;s handling of that data is
          governed by their own API terms, not this policy.
        </p>
      </Section>

      <Section title="Who else sees your data">
        <p>We rely on a small number of service providers to run Longtable. We don&rsquo;t sell your data to anyone, and we don&rsquo;t share it for advertising.</p>
        <p>
          <strong>Supabase</strong> hosts our database and handles sign-in — effectively everything described above
          passes through their infrastructure. <strong>Vercel</strong> hosts the website itself.{" "}
          <strong>Anthropic</strong> processes Study Companion and Study Guide requests, as described above.{" "}
          <strong>Resend</strong> sends account-related emails (like sign-in links) on our behalf. If you sign in
          with Google, <strong>Google</strong> shares basic profile information with us as part of that sign-in.
          Audio narration streams directly from <strong>archive.org / LibriVox</strong> when you play it — your
          browser connects to their servers directly for that, not ours.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          Longtable uses a small number of cookies and browser storage values required for the app to function:
          keeping you signed in, and remembering your light/dark theme preference. We don&rsquo;t use cookies for
          advertising or cross-site tracking.
        </p>
      </Section>

      <Section title="How long we keep your data">
        <p>
          We keep your data for as long as your account exists, so your highlights, journal, and plan progress stay
          available to you. If you&rsquo;d like your data deleted, contact us (below) and we&rsquo;ll delete your
          account and associated content. We don&rsquo;t currently have a self-serve &ldquo;delete my account&rdquo;
          button in the app itself — that&rsquo;s a known gap we intend to close.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Longtable is not directed at, or knowingly used to collect information from, children under 13. If you
          believe a child has provided us with personal information, please contact us and we&rsquo;ll remove it.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use industry-standard measures to protect your data, including encrypted connections (HTTPS) and
          database-level access controls that restrict each person&rsquo;s data to themselves (and, where you&rsquo;ve
          chosen to share something, to your Table). No system is perfectly secure, and we can&rsquo;t guarantee
          absolute security.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Wherever you&rsquo;re located, you can ask us to access, correct, or delete the personal information we
          hold about you by contacting us below. We&rsquo;ll respond as promptly as we reasonably can.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make a material change to this policy, we&rsquo;ll update the date at the top of this page. We
          encourage you to check back occasionally.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy, or requests about your data, can be sent to{" "}
          <a href="mailto:privacy@longtable.study" style={{ color: C.gold, fontWeight: 600 }}>
            privacy@longtable.study
          </a>
          .
        </p>
      </Section>
    </div>
  );
}

import { C } from "@/lib/constants";

export const metadata = { title: "Terms of Service — Longtable" };

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

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, color: C.ink }} className="mb-2">
        Terms of Service
      </h1>
      <p className="text-sm mb-10" style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}>
        Last updated August 2026
      </p>

      <Section title="Agreement">
        <p>
          These terms govern your use of Longtable (longtable.study). By using Longtable, you agree to them. If
          you don&rsquo;t agree, please don&rsquo;t use the site. Longtable is currently operated by an individual,
          not a registered company or nonprofit corporation.
        </p>
      </Section>

      <Section title="What Longtable is">
        <p>
          Longtable is a free, non-commercial Bible study platform: Scripture reading, search, study tools, an
          AI-assisted Study Companion, reading plans, a personal journal, and small invite-only groups
          (&ldquo;Tables&rdquo;) for reading, praying, and reflecting with people you invite. It is not affiliated
          with any denomination, and it does not charge for or solicit money for any feature.
        </p>
      </Section>

      <Section title="Who can use it">
        <p>
          Longtable is not intended for children under 13. By using the service, you confirm you meet this minimum
          age (or, if the minimum age where you live is higher, that you meet that age).
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You can use most of Longtable anonymously. If you save an account with an email or Google sign-in,
          you&rsquo;re responsible for keeping access to that email or Google account secure, since it&rsquo;s how
          you&rsquo;ll get back into Longtable.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          You own what you write — journal entries, notes, prayer requests, discussion comments, everything.
          By posting it, you give Longtable the limited right to store and display it back to you (and, where you
          choose to share it, to the members of a specific Table) solely to provide the service. We don&rsquo;t
          claim ownership of your content, sell it, or use it to train AI models.
        </p>
      </Section>

      <Section title="Conduct in Tables">
        <p>
          Tables are meant to be small, trusted spaces. Don&rsquo;t use them to harass, threaten, or abuse anyone;
          post illegal content; or spam. A Table&rsquo;s owner can remove members or remove any content posted in
          their Table. We reserve the right to remove content or suspend accounts that violate these terms
          anywhere on the platform, though as a small, community-moderated project, our ability to actively monitor
          every Table is limited — Table owners are the primary moderators of their own spaces.
        </p>
        <p>
          If you or someone you know is in crisis, please reach out to a local emergency service or crisis line —
          Longtable is a study and reflection tool, not a substitute for professional help.
        </p>
      </Section>

      <Section title="The Study Companion and AI features">
        <p>
          The Study Companion and Study Guide are AI-assisted tools intended to describe biblical texts, history,
          and the range of ways different traditions have understood a passage. They are not a substitute for the
          guidance of clergy, a faith community, or a mental health or medical professional, and they do not
          speak on behalf of God or any religious authority. AI-generated content can be incomplete or mistaken —
          use your own judgment, and consult trusted people in your life for anything significant.
        </p>
      </Section>

      <Section title="Scripture and third-party content">
        <p>
          Bible text (World English Bible, King James Version, American Standard Version) and study content
          (LibriVox audio narration, the Treasury of Scripture Knowledge, Easton&rsquo;s Bible Dictionary, and the
          commentaries of Matthew Henry, Jamieson-Fausset-Brown, and Albert Barnes) are all in the public domain.
          Where displayed, they reflect their original historic authors&rsquo; own voice and tradition, not
          Longtable&rsquo;s.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          Longtable is provided &ldquo;as is,&rdquo; free of charge, without warranties of any kind. We don&rsquo;t
          guarantee it will be uninterrupted, error-free, or permanently available — it&rsquo;s a small,
          independently run project.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, Longtable and its operator aren&rsquo;t liable for any indirect,
          incidental, or consequential damages arising from your use of the service. Nothing in these terms limits
          liability that can&rsquo;t legally be limited.
        </p>
      </Section>

      <Section title="Ending your use">
        <p>
          You can stop using Longtable, or ask us to delete your account, at any time (see the Privacy Policy for
          how). We may suspend or terminate access for anyone who violates these terms.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms as Longtable grows. If we make a material change, we&rsquo;ll update the date
          at the top of this page. Continuing to use Longtable after a change means you accept the updated terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by generally applicable principles of fair dealing, without designating a
          specific state or country&rsquo;s courts as exclusive, given Longtable&rsquo;s current status as an
          individually operated project.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:privacy@longtable.study" style={{ color: C.gold, fontWeight: 600 }}>
            privacy@longtable.study
          </a>
          .
        </p>
      </Section>
    </div>
  );
}

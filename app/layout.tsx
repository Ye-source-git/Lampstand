import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { C, FONTS_URL } from "@/lib/constants";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Longtable — Bible study for everyone",
  description: "Scripture, open to everyone — whatever your tradition, wherever you’re starting.",
  appleWebApp: {
    title: "Longtable",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EFF1EA" },
    { media: "(prefers-color-scheme: dark)", color: "#1B211A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Legacy iOS versions only honor the apple-prefixed tag; Next's `appleWebApp`
            metadata already emits the modern unprefixed one for current Safari. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="stylesheet" href={FONTS_URL} />
        {/* Applies a saved theme preference before first paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("lampstand-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: C.paper }}>
        <AuthProvider>
          <div className="min-h-screen" style={{ background: C.paper }}>
            <Nav />
            <main className="px-5 py-8 max-w-3xl mx-auto">{children}</main>
            <footer className="px-5 pb-10 max-w-3xl mx-auto">
              <p className="text-[11px] leading-relaxed" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
                Longtable is a non-profit project. Scripture: World English Bible, King James
                Version, and American Standard Version (public domain). Audio narration and study
                references include material from LibriVox, the Treasury of Scripture Knowledge,
                Easton&rsquo;s Bible Dictionary, and the classic commentaries of Matthew Henry,
                Jamieson-Fausset-Brown, and Albert Barnes (all public domain) &mdash; these reflect
                each historic author&rsquo;s own voice and tradition, not Longtable&rsquo;s. The
                Study Companion is an AI study tool — it describes texts, history, and the range of
                traditional interpretations; it does not decide questions of faith for you.
              </p>
              <p className="text-[11px] mt-3" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                <Link href="/privacy" style={{ color: C.inkSoft }}>
                  Privacy Policy
                </Link>
                <span style={{ color: C.border }}> · </span>
                <Link href="/terms" style={{ color: C.inkSoft }}>
                  Terms of Service
                </Link>
              </p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { C, FONTS_URL } from "@/lib/constants";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { Nav } from "@/components/Nav";

// TODO: replace with the real Ko-fi / Stripe / Donorbox donation link before public launch.
const DONATE_URL = "https://ko-fi.com/lampstand";

export const metadata: Metadata = {
  title: "Lampstand — Bible study for everyone",
  description: "Scripture, open to everyone — whatever your tradition, wherever you’re starting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: C.paper }}>
        <AuthProvider>
          <div className="min-h-screen" style={{ background: C.paper }}>
            <Nav />
            <main className="px-5 py-8 max-w-3xl mx-auto">{children}</main>
            <footer className="px-5 pb-10 max-w-3xl mx-auto">
              <p className="text-[11px] leading-relaxed mb-2" style={{ color: C.inkSoft, fontFamily: "'Albert Sans', sans-serif" }}>
                Lampstand is a non-profit project. Scripture: World English Bible, King James
                Version, and American Standard Version (public domain). The Study Companion is an
                AI study tool — it describes texts, history, and the range of traditional
                interpretations; it does not decide questions of faith for you.
              </p>
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold"
                style={{ color: C.gold, fontFamily: "'Albert Sans', sans-serif" }}
              >
                Support Lampstand →
              </a>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

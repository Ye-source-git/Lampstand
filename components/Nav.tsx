"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { C } from "@/lib/constants";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/read", label: "Read" },
  { href: "/search", label: "Search" },
  { href: "/plans", label: "Plans" },
  { href: "/companion", label: "Companion" },
  { href: "/guide", label: "Study Guide" },
  { href: "/journal", label: "Journal" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <>
      <header className="px-5 pt-8 pb-4 max-w-3xl mx-auto flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <Link href="/">
              <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, color: C.ink }}>
                Lampstand
              </h1>
            </Link>
          </div>
          <p className="text-sm mt-1" style={{ color: C.inkSoft, fontFamily: "'Lora', serif", fontStyle: "italic" }}>
            Scripture, open to everyone — whatever your tradition, wherever you’re starting.
          </p>
        </div>
        <div className="pt-1 flex-shrink-0 flex items-center gap-4">
          <ThemeToggle />
          {!loading && (user && !user.is_anonymous ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-semibold focus:outline-none"
              style={{ fontFamily: "'Albert Sans', sans-serif", color: C.inkSoft }}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold focus:outline-none"
              style={{ fontFamily: "'Albert Sans', sans-serif", color: C.gold }}
            >
              {user?.is_anonymous ? "Save your progress" : "Sign in"}
            </Link>
          ))}
        </div>
      </header>

      <nav className="px-5 max-w-3xl mx-auto flex flex-wrap gap-x-1 border-b" style={{ borderColor: C.border }}>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-3 sm:px-4 py-2 text-sm font-medium transition-colors focus:outline-none whitespace-nowrap"
            style={{
              fontFamily: "'Albert Sans', sans-serif",
              color: pathname === l.href ? C.ink : C.inkSoft,
              borderBottom: pathname === l.href ? `2px solid ${C.gold}` : "2px solid transparent",
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

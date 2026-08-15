import * as Sentry from "@sentry/nextjs";

// NEXT_PUBLIC_SENTRY_DSN is only set in Vercel's Production environment (not
// local dev, not .env.local) — so local testing never reports to Sentry, and
// only the real deployed site does.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

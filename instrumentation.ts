import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Same DSN, same runtime/environment gating as instrumentation-client.ts —
  // only set in Vercel's Production environment.
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // Readable production stack traces need SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN,
  // which aren't set up yet — disable source map upload until they are, rather than
  // fail or warn noisily on every build.
  sourcemaps: { disable: true },
});

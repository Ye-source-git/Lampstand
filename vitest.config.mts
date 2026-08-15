import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
  test: {
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    // RLS tests hit a real (local) database over the network — give them room.
    testTimeout: 15000,
    fileParallelism: false,
  },
});

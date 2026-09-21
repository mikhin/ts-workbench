import path from "node:path";
import { defineConfig } from "vitest/config";

process.env["TZ"] = "UTC";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    coverage: {
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/api/**", "src/mocks/**", "src/main.tsx"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reportsDirectory: "reports/coverage",
      thresholds: { 100: true },
    },
    css: false,
    environment: "happy-dom",
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.{test,spec}.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});

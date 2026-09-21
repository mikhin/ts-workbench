import path from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

process.env["TZ"] = "UTC";

export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    coverage: {
      exclude: ["src/**/*.{test,spec}.ts", "src/main.ts", "src/**/*.module.ts"],
      include: ["src/**/*.ts"],
      provider: "v8",
      reportsDirectory: "reports/coverage",
      thresholds: { 100: true },
    },
    environment: "node",
    include: ["src/**/*.{test,spec}.ts", "scripts/**/*.{test,spec}.ts"],
  },
});

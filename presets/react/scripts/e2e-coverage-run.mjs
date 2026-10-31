import { spawnSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";

import { sourceHashes } from "./coverage-state.mjs";

if (process.argv.length > 2) {
  throw new Error("Run the complete suite: test:e2e:coverage accepts no test filters.");
}

const directory = "reports/e2e-coverage";
const before = sourceHashes();

rmSync(directory, { force: true, recursive: true });

const result = spawnSync("pnpm", ["exec", "playwright", "test", "--project=chromium"], {
  env: { ...process.env, E2E_COVERAGE: "1" },
  stdio: "inherit",
});

if (result.status !== 0) process.exit(result.status ?? 1);

if (!existsSync(`${directory}/coverage-final.json`)) {
  throw new Error("E2E coverage is missing. Import test from tests/fixtures.");
}

if (JSON.stringify(before) !== JSON.stringify(sourceHashes())) {
  throw new Error("Source changed during coverage collection; rerun test:e2e:coverage.");
}

writeFileSync(`${directory}/source-hashes.json`, JSON.stringify(before));

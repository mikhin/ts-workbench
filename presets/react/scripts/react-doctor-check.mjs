import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";

import { doctorPassed } from "./react-doctor-result.mjs";

const files = globSync("src/**/*.{ts,tsx}").filter(
  (file) => !/\.(test|spec|stories)\.tsx?$/.test(file) && !file.endsWith(".d.ts"),
);
const result = spawnSync(
  "pnpm",
  ["exec", "react-doctor", ...files, "--json", "--no-score", "--no-supply-chain"],
  {
    encoding: "utf8",
  },
);
const output = result.stdout ?? "";

process.stdout.write(output);

process.stderr.write(result.stderr ?? "");

if (!doctorPassed(result.status, output)) {
  console.error("React Doctor failed, skipped its lint pass, or returned no recognized summary.");

  process.exitCode = 1;
}

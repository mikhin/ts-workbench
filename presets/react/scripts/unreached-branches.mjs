import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";

import { addedLines } from "./added-lines.mjs";
import { coverageLines, sourceHashes } from "./coverage-state.mjs";

const baseRef = process.argv[2] ?? "origin/main";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const base = git("merge-base", baseRef, "HEAD");
const isSource = (file) =>
  /^src\/.*\.tsx?$/.test(file) && !/\.(test|spec|stories)\.tsx?$|\.d\.ts$/.test(file);
const untracked = git("ls-files", "--others", "--exclude-standard", "--", "src")
  .split("\n")
  .filter(isSource);
const files = [
  ...new Set([
    ...git("diff", "--name-only", "--diff-filter=AM", base, "--", "src")
      .split("\n")
      .filter(isSource),
    ...untracked,
  ]),
];

if (files.length === 0) {
  console.log(`No changed source files against ${baseRef}.`);

  process.exit(0);
}

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const snapshot = readJson("reports/e2e-coverage/source-hashes.json");

if (JSON.stringify(snapshot) !== JSON.stringify(sourceHashes())) {
  throw new Error("E2E coverage is stale; run test:e2e:coverage.");
}

rmSync("reports/unit-coverage", { force: true, recursive: true });

const unit = spawnSync(
  "pnpm",
  [
    "exec",
    "vitest",
    "run",
    "--coverage",
    "--coverage.thresholds.100=false",
    "--coverage.reporter=json",
    "--coverage.reportsDirectory=reports/unit-coverage",
  ],
  { stdio: "inherit" },
);

if (unit.status !== 0) process.exit(unit.status ?? 1);

const reports = [
  "reports/e2e-coverage/coverage-final.json",
  "reports/unit-coverage/coverage-final.json",
].map(
  (file) =>
    new Map(
      Object.entries(readJson(file)).map(([name, coverage]) => [
        path.relative(process.cwd(), path.resolve(name)),
        coverageLines(coverage),
      ]),
    ),
);

let total = 0;

for (const file of files) {
  const loaded = reports.flatMap((report) => (report.has(file) ? [report.get(file)] : []));

  if (loaded.length === 0) {
    console.log(`${file}: no test loads it`);

    total += 1;

    continue;
  }

  const source = readFileSync(file, "utf8").split("\n");
  const lines = untracked.includes(file)
    ? source.map((_line, index) => index + 1)
    : [...addedLines(git("diff", "--unified=0", base, "--", file))];
  const unreached = lines.filter(
    (line) =>
      loaded.some((coverage) => coverage.missed.has(line)) &&
      !loaded.some((coverage) => coverage.covered.has(line)),
  );

  for (const line of unreached) {
    console.log(`${file}:${line} ${source[line - 1].trim()}`);
  }

  total += unreached.length;
}

console.log(
  `${total} changed statement lines or files without coverage. This does not prove branch coverage.`,
);

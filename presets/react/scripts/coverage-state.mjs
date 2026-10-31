import { createHash } from "node:crypto";
import { globSync, readFileSync } from "node:fs";

export const sourceHashes = () =>
  Object.fromEntries(
    globSync("src/**/*.{ts,tsx}")
      .toSorted()
      .map((file) => [file, createHash("sha256").update(readFileSync(file)).digest("hex")]),
  );

export const coverageLines = (coverage) => {
  const covered = new Set();
  const missed = new Set();

  for (const [id, hits] of Object.entries(coverage.s)) {
    (hits > 0 ? covered : missed).add(coverage.statementMap[id].start.line);
  }

  return { covered, missed };
};

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import { coverageLines } from "./coverage-state.mjs";
import { doctorPassed } from "./react-doctor-result.mjs";

test("React Doctor fails on skipped checks, errors, missing summaries and failed processes", () => {
  assert.equal(doctorPassed(0, "✔ No issues found!"), true);

  assert.equal(doctorPassed(0, "⚠ 19 warnings across 19/1523 files"), true);

  assert.equal(doctorPassed(0, "✗ 1 error across 1/12 files"), false);

  assert.equal(doctorPassed(0, "non-fatal, skipping\n✔ No issues found!"), false);

  assert.equal(doctorPassed(0, "Unexpected output"), false);

  assert.equal(doctorPassed(1, "✔ No issues found!"), false);

  assert.equal(doctorPassed(null, ""), false);
});

test("coverage retains hit and missed statement lines", () => {
  const lines = coverageLines({
    s: { 0: 1, 1: 0 },
    statementMap: { 0: { start: { line: 2 } }, 1: { start: { line: 5 } } },
  });

  assert.deepEqual([...lines.covered], [2]);

  assert.deepEqual([...lines.missed], [5]);
});

test("coverage refuses filtered runs before starting Playwright", () => {
  const result = spawnSync(process.execPath, ["scripts/e2e-coverage-run.mjs", "--grep=smoke"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 1);

  assert.match(result.stderr, /accepts no test filters/);
});

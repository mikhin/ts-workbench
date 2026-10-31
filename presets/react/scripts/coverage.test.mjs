import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import { coverageLines } from "./coverage-state.mjs";
import { doctorPassed } from "./react-doctor-result.mjs";

test("React Doctor fails on skipped checks, errors, missing summaries and failed processes", () => {
  const project = { analyzedFileCount: 2, complete: true, skippedChecks: [] };
  const report = { ok: true, projects: [project], summary: { errorCount: 0 } };
  const output = JSON.stringify(report);

  assert.equal(doctorPassed(0, output), true);

  assert.equal(doctorPassed(0, JSON.stringify({ ...report, summary: { errorCount: 1 } })), false);

  assert.equal(
    doctorPassed(
      0,
      JSON.stringify({ ...report, projects: [{ ...project, skippedChecks: ["lint"] }] }),
    ),
    false,
  );

  assert.equal(
    doctorPassed(0, JSON.stringify({ ...report, projects: [{ ...project, complete: false }] })),
    false,
  );

  assert.equal(doctorPassed(0, JSON.stringify({ ...report, projects: [] })), false);

  assert.equal(doctorPassed(0, "Unexpected output"), false);

  assert.equal(doctorPassed(1, output), false);

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

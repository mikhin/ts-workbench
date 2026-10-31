import assert from "node:assert/strict";
import { test } from "node:test";

import rule from "./no-effect-rule-disable.cjs";

const reportsFor = (value) => {
  const reports = [];
  const listeners = rule.create({
    report: (report) => reports.push(report.data.rule),
    sourceCode: { getAllComments: () => [{ loc: {}, value }] },
  });

  const visit = listeners.Program;

  visit();

  return reports;
};

test("guards effect rules and blanket disables while allowing unrelated rules", () => {
  assert.deepEqual(reportsFor(" oxlint-disable-next-line react/exhaustive-deps -- reason"), [
    "react/exhaustive-deps",
  ]);

  assert.deepEqual(reportsFor(" eslint-disable react-hooks/refs, no-console"), [
    "react-hooks/refs",
  ]);

  assert.deepEqual(reportsFor(" oxlint-disable "), ["all rules"]);

  assert.deepEqual(reportsFor(" oxlint-disable -- reason"), ["all rules"]);

  assert.deepEqual(reportsFor(" oxlint-disable-next-line no-console"), []);

  assert.deepEqual(reportsFor(" oxlint-enable react/exhaustive-deps"), []);
});

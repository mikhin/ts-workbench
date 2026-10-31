import assert from "node:assert/strict";
import { test } from "node:test";

import { addedLines } from "./added-lines.mjs";

test("changed lines include insertions and replacements but not deletions", () => {
  const diff = "@@ -1 +1 @@\n@@ -4,0 +4,3 @@\n@@ -10,2 +12,0 @@";

  assert.deepEqual([...addedLines(diff)], [1, 4, 5, 6]);
});

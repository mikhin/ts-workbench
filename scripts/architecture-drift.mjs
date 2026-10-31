import { existsSync } from "node:fs";
import path from "node:path";

import { ROOT } from "./resolve-module.mjs";
import { lineAt, sources, visitSource } from "./source-analysis.mjs";

const candidates = [];

for (const { file, source } of sources()) {
  const ui =
    /^src\/(components|pages|hooks)\//.test(file) && !file.startsWith("src/components/ui/");
  const store = file.startsWith("src/stores/");
  const report = (node, reason) => {
    candidates.push({ file, reason });

    console.log(`${file}:${lineAt(source, node)} ${reason}`);
  };

  visitSource(file, source, {
    CallExpression(node) {
      if (!ui || node.callee.type !== "MemberExpression" || node.callee.computed) return;

      if (["reduce", "sort", "toSorted"].includes(node.callee.property.name)) {
        report(node, "collection calculation in UI");
      }

      if (node.callee.object.type === "Identifier" && node.callee.object.name === "Math") {
        report(node, "Math calculation in UI");
      }
    },
    IfStatement(node) {
      if (store) report(node, "branch in store");
    },
    SwitchStatement(node) {
      if (store) report(node, "branch in store");
    },
  });

  if (!file.startsWith("src/services/") || file.endsWith("test-utils.ts")) continue;

  const stem = file.replace(/\.tsx?$/, "");
  const tested = [".test.ts", ".spec.ts", ".test.tsx", ".spec.tsx"].some((suffix) =>
    existsSync(path.resolve(ROOT, stem + suffix)),
  );

  if (!tested) report({ start: 0 }, "no colocated test (may be covered elsewhere)");
}

console.log(
  `${candidates.length} architecture candidates. Review layout calculations and integration coverage before changing code.`,
);

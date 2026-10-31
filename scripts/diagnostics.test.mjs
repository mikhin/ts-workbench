import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const ROOT = path.resolve(import.meta.dirname, "..");

test("diagnostics report candidates, imports and missing specs without blocking", () => {
  const root = mkdtempSync(path.join(ROOT, ".tooling-test-"));

  try {
    cpSync(path.join(ROOT, "scripts"), path.join(root, "scripts"), { recursive: true });

    writeFileSync(path.join(root, "package.json"), '{"type":"module"}');

    writeFileSync(path.join(root, "knip.json"), '{"entry":["src/main.ts"]}');

    mkdirSync(path.join(root, "src/services"), { recursive: true });

    mkdirSync(path.join(root, "src/components"), { recursive: true });

    writeFileSync(
      path.join(root, "src/services/example.ts"),
      "export const service = { used: () => 1, unused: () => 2 }; export type A = { x: string; y: number };",
    );

    writeFileSync(
      path.join(root, "src/components/example.tsx"),
      'import { service as renamed } from "../services/example"; export type B = { y: number; x: string }; export const result = Math.max(renamed.used(), 2);',
    );

    const run = (script) => {
      const result = spawnSync(process.execPath, [`scripts/${script}.mjs`], {
        cwd: root,
        encoding: "utf8",
      });

      assert.equal(result.status, 0, result.stderr);

      return result.stdout;
    };

    assert.match(run("find-duplicate-types"), /1 repeated object shapes/);

    const dead = run("find-dead-service-methods");

    assert.match(dead, /example.ts:1 unused/);

    assert.doesNotMatch(dead, /example.ts:1 used/);

    assert.match(run("service-map"), /<- src\/components\/example.tsx/);

    assert.match(run("architecture-drift"), /Math calculation in UI/);

    assert.match(run("architecture-drift"), /no colocated test/);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Diagnostic = { code: string };

const root = path.resolve(import.meta.dirname, "..");
const oxlint = path.resolve(root, "node_modules/.bin/oxlint");

const lintSource = (source: string): string[] => {
  const dir = mkdtempSync(path.join(tmpdir(), "comment-directives-"));

  try {
    writeFileSync(path.join(dir, "probe.ts"), source);

    const { stdout } = spawnSync(
      oxlint,
      ["-c", path.join(root, ".oxlintrc.json"), "--format", "json", "."],
      { cwd: dir, encoding: "utf8" },
    );
    const { diagnostics } = JSON.parse(stdout) as { diagnostics: Diagnostic[] };

    return diagnostics.map(({ code }) => code);
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
};

describe("a ponytail: directive under the project lint", () => {
  it("passes no-comments and capitalized-comments alike", () => {
    const codes = lintSource("// ponytail: a known ceiling\nexport const answer = 1;\n");

    expect(codes).not.toContain("local(no-comments)");
    expect(codes).not.toContain("eslint(capitalized-comments)");
  });

  it("stays the only lowercase comment the lint accepts", () => {
    const codes = lintSource("// a prose comment\nexport const answer = 1;\n");

    expect(codes).toContain("local(no-comments)");
    expect(codes).toContain("eslint(capitalized-comments)");
  });
});

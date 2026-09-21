import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PRESETS = path.resolve(ROOT, "presets");
const NOT_COPIED = new Set(["CLAUDE.md", "package.json", "README.md"]);
const KEEPS_PRESETS = "monorepo";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, data) => writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const sorted = (object) =>
  Object.fromEntries(Object.entries(object).toSorted(([a], [b]) => a.localeCompare(b)));

const names = process.argv.slice(2);
const available = readdirSync(PRESETS);

if (names.length === 0 || names.some((name) => !available.includes(name))) {
  console.error(`Usage: pnpm preset <${available.join("|")}> [more...]`);

  process.exit(1);
}

const copyEntry = (dir, entry) => {
  const target = path.resolve(ROOT, entry);

  cpSync(path.resolve(dir, entry), target, { recursive: true });

  if (entry.endsWith(".json")) {
    writeFileSync(target, readFileSync(target, "utf8").replaceAll("../../", "./"));
  }
};

const copyFiles = (preset) => {
  const dir = path.resolve(PRESETS, preset);

  for (const entry of readdirSync(dir).filter((name) => !NOT_COPIED.has(name))) {
    copyEntry(dir, entry);
  }
};

const mergePackageJson = (preset) => {
  const file = path.resolve(PRESETS, preset, "package.json");

  if (!existsSync(file)) return;

  const fragment = readJson(file);
  const target = path.resolve(ROOT, "package.json");
  const pkg = readJson(target);

  for (const key of ["scripts", "dependencies", "devDependencies"]) {
    if (fragment[key]) pkg[key] = sorted({ ...pkg[key], ...fragment[key] });
  }

  if (fragment.type) pkg.type = fragment.type;

  writeJson(target, pkg);
};

const appendGuidelines = (preset) => {
  const file = path.resolve(PRESETS, preset, "CLAUDE.md");

  if (!existsSync(file)) return;

  const target = path.resolve(ROOT, "CLAUDE.md");

  writeFileSync(
    target,
    `${readFileSync(target, "utf8").trimEnd()}\n\n${readFileSync(file, "utf8")}`,
  );
};

const printNotes = (preset) => {
  const file = path.resolve(PRESETS, preset, "README.md");

  if (existsSync(file)) console.log(`\n${readFileSync(file, "utf8")}`);
};

const removeSelf = () => {
  const pkgFile = path.resolve(ROOT, "package.json");
  const pkg = readJson(pkgFile);

  delete pkg.scripts.preset;

  writeJson(pkgFile, pkg);

  rmSync(PRESETS, { recursive: true });

  rmSync(path.resolve(ROOT, "scripts/preset.mjs"));
};

for (const preset of names) {
  copyFiles(preset);

  mergePackageJson(preset);

  appendGuidelines(preset);

  printNotes(preset);

  console.log(`Applied preset: ${preset}`);
}

spawnSync("pnpm", ["install"], { cwd: ROOT, stdio: "inherit" });

if (!names.includes(KEEPS_PRESETS)) removeSelf();

spawnSync("pnpm", ["format:fix"], { cwd: ROOT, stdio: "ignore" });

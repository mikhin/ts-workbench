import { readFileSync } from "node:fs";
import path from "node:path";
import { parseSync, Visitor } from "oxc-parser";

import { ROOT, sourceFiles } from "./resolve-module.mjs";

export const visitSource = (file, source, listeners) => {
  const result = parseSync(file, source);

  if (result.errors.length > 0) {
    throw new Error(`Cannot parse ${file}: ${result.errors[0].message}`);
  }

  new Visitor(listeners).visit(result.program);

  return result.program;
};

export const sources = () =>
  sourceFiles()
    .filter((file) => !/\.(stories)\.tsx?$/.test(file))
    .map((file) => ({ file, source: readFileSync(path.resolve(ROOT, file), "utf8") }));

export const lineAt = (source, node) => source.slice(0, node.start).split("\n").length;

const POSITION_KEYS = new Set(["end", "loc", "range", "raw", "start"]);

const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);

  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !POSITION_KEYS.has(key))
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, canonical(child)]),
  );
};

export const objectShapes = (file, source) => {
  const shapes = [];
  const record = (node, members, name) => {
    if (
      members.length < 2 ||
      members.some((member) => member.type !== "TSPropertySignature" || member.computed)
    ) {
      return;
    }

    shapes.push({
      file,
      line: lineAt(source, node),
      name,
      signature: members
        .map((member) => JSON.stringify(canonical(member)))
        .toSorted()
        .join(";"),
    });
  };

  visitSource(file, source, {
    TSInterfaceDeclaration(node) {
      if (!node.typeParameters && node.extends.length === 0) {
        record(node, node.body.body, node.id.name);
      }
    },
    TSTypeAliasDeclaration(node) {
      if (!node.typeParameters && node.typeAnnotation.type === "TSTypeLiteral") {
        record(node, node.typeAnnotation.members, node.id.name);
      }
    },
  });

  return shapes;
};

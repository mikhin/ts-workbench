import path from "node:path";

import { resolveModule, ROOT } from "./resolve-module.mjs";
import { sources, visitSource } from "./source-analysis.mjs";

const folder = process.argv[2] ?? "";
const prefix = folder ? `src/services/${folder}/` : "src/services/";
const graph = new Map();

for (const { file, source } of sources()) {
  const dependencies = new Set();
  const record = (specifier) => {
    const resolved = resolveModule(specifier, path.resolve(ROOT, file));

    if (resolved) dependencies.add(path.relative(ROOT, resolved));
  };

  visitSource(file, source, {
    ExportAllDeclaration: (node) => record(node.source.value),
    ExportNamedDeclaration: (node) => {
      if (node.source) record(node.source.value);
    },
    ImportDeclaration: (node) => record(node.source.value),
    ImportExpression: (node) => {
      if (node.source.type === "Literal") record(node.source.value);
    },
  });

  graph.set(file, dependencies);
}

for (const [file, dependencies] of graph) {
  if (!file.startsWith(prefix)) continue;

  console.log(file);

  for (const dependency of dependencies) console.log(`  -> ${dependency}`);

  const callers = [...graph].filter(([, imports]) => imports.has(file));

  for (const [caller] of callers) console.log(`  <- ${caller}`);
}

if (![...graph.keys()].some((file) => file.startsWith(prefix))) {
  console.log(`No services in ${prefix}`);
}

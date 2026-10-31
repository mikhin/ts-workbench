import { objectShapes, sources } from "./source-analysis.mjs";

const groups = Map.groupBy(
  sources().flatMap(({ file, source }) => objectShapes(file, source)),
  (shape) => shape.signature,
);
const duplicates = [...groups.values()].filter((group) => group.length > 1);

for (const group of duplicates) {
  console.log(group.map(({ file, line, name }) => `${file}:${line} ${name}`).join("\n"));

  console.log("");
}

console.log(
  `${duplicates.length} repeated object shapes. Review candidates; type references are not resolved.`,
);

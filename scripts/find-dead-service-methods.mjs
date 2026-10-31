import { lineAt, sources, visitSource } from "./source-analysis.mjs";

const methods = [];
const references = new Set();
const dynamicAccess = new Set();

for (const { file, source } of sources()) {
  visitSource(file, source, {
    MemberExpression(node) {
      if (!node.computed) references.add(node.property.name);
      else if (node.property.type === "Literal") references.add(String(node.property.value));
      else dynamicAccess.add(file);
    },
    ObjectPattern(node) {
      for (const property of node.properties) {
        if (property.type === "Property" && !property.computed) {
          references.add(property.key.name ?? property.key.value);
        }
      }
    },
    Property(node) {
      if (!file.startsWith("src/services/") || node.computed) return;

      if (!["ArrowFunctionExpression", "FunctionExpression"].includes(node.value.type)) return;

      methods.push({ file, line: lineAt(source, node), name: node.key.name ?? node.key.value });
    },
  });
}

const candidates = methods.filter(({ name }) => !references.has(name));

for (const { file, line, name } of candidates) console.log(`${file}:${line} ${name}`);

console.log(
  `${candidates.length} method candidates without a static property read. Review escapes and external consumers before deleting.`,
);

if (dynamicAccess.size > 0) {
  console.log("Computed property access exists; it may call these methods.");
}

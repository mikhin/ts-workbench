const isExported = (sourceCode, node) =>
  sourceCode
    .getDeclaredVariables(node)
    .some((variable) =>
      variable.references.some(
        ({ identifier }) =>
          identifier.parent.type === "ExportSpecifier" ||
          identifier.parent.type === "ExportDefaultDeclaration",
      ),
    );

const isPlainRename = (node) =>
  !node.typeParameters &&
  node.typeAnnotation.type === "TSTypeReference" &&
  !node.typeAnnotation.typeArguments &&
  node.parent.type !== "ExportNamedDeclaration";

module.exports = {
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      TSTypeAliasDeclaration(node) {
        if (!isPlainRename(node) || isExported(sourceCode, node)) return;

        context.report({
          data: { name: node.id.name, type: sourceCode.getText(node.typeAnnotation) },
          messageId: "redundant",
          node: node.id,
        });
      },
    };
  },
  meta: {
    docs: { description: "Disallow local aliases that only rename another type" },
    messages: {
      redundant: 'Use "{{type}}" directly instead of the redundant local alias "{{name}}".',
    },
    type: "suggestion",
  },
};

const GUARDED =
  /^(?:react-you-might-not-need-an-effect\/[\w-]+|react(?:-hooks)?\/(?:exhaustive-deps|immutability|no-deriving-state-in-effects|refs|set-state-in-effect|set-state-in-render))$/;

module.exports = {
  create(context) {
    const source = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        for (const comment of source.getAllComments()) {
          const text = comment.value.trim().split("-- ")[0].trim();
          const directive = text.match(/^(?:eslint|oxlint)-disable(?:-next-line|-line)?\b([^]*)$/);

          if (!directive) continue;

          const rules = (directive[1] ?? "")
            .split(",")
            .map((rule) => rule.trim())
            .filter(Boolean);

          for (const rule of rules.length === 0
            ? ["all rules"]
            : rules.filter((name) => GUARDED.test(name))) {
            context.report({ data: { rule }, loc: comment.loc, messageId: "disabled" });
          }
        }
      },
    };
  },
  meta: {
    docs: { description: "Keep effect and ref checks enabled" },
    messages: {
      disabled:
        "Do not silence {{rule}} inline. Derive the value during render or handle the user action in its event handler. A justified exception belongs in a scoped lint configuration.",
    },
    type: "problem",
  },
};

const SHAPE_MATCHERS = new Set(["toBeDefined", "toBeTruthy"]);
const THROWING_QUERY = /^(?:get|find)By/;
const COMPONENT_SPEC = /\.(?:spec|test)\.tsx$/;

const unwrap = (node) => (node?.type === "AwaitExpression" ? node.argument : node);

const queryName = (node) => {
  const call = unwrap(node);

  if (call?.type !== "CallExpression") return null;

  const { callee } = call;

  if (callee.type === "Identifier") return callee.name;

  return callee.type === "MemberExpression" && callee.property.type === "Identifier"
    ? callee.property.name
    : null;
};

const isExpectCall = (node) =>
  node.type === "CallExpression" &&
  node.callee.type === "Identifier" &&
  node.callee.name === "expect";

const shapeMatcher = (node) => {
  const { callee } = node;

  if (callee.type !== "MemberExpression" || callee.property.type !== "Identifier") return null;

  const matcher = callee.property.name;

  if (!SHAPE_MATCHERS.has(matcher) || node.arguments.length > 0) return null;

  return isExpectCall(callee.object) ? matcher : null;
};

module.exports = {
  create(context) {
    const isComponentSpec = COMPONENT_SPEC.test(context.filename ?? context.getFilename());

    return {
      CallExpression(node) {
        const matcher = shapeMatcher(node);

        if (!matcher) return;

        const property = node.callee.property;
        const name = queryName(node.callee.object.arguments[0]);

        if (isComponentSpec && name && THROWING_QUERY.test(name)) {
          context.report({
            data: { matcher },
            fix: (fixer) => fixer.replaceText(property, "toBeInTheDocument"),
            messageId: "query",
            node: property,
          });

          return;
        }

        context.report({ data: { matcher }, messageId: "shape", node: property });
      },
    };
  },
  meta: {
    docs: { description: "Disallow assertions that a blank or wrong value also passes" },
    fixable: "code",
    messages: {
      query:
        "{{matcher}} on a query that throws when nothing matches asserts nothing. Use toBeInTheDocument().",
      shape:
        "{{matcher}} passes on any value. Assert the value itself: toBe, toStrictEqual, toHaveTextContent.",
    },
    type: "problem",
  },
};

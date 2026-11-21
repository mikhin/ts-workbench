const TEST_FILE = /\.(?:spec|test)\.tsx?$/;
const DOM_TYPE = /^(?:Element|(?:HTML|SVG)\w*Element)$/;

const isUseRef = (callee) =>
  (callee.type === "Identifier" && callee.name === "useRef") ||
  (callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier" &&
    callee.property.name === "useRef");

const typeArgument = (call) => (call.typeArguments ?? call.typeParameters)?.params?.[0];

const namesType = (type, pattern) =>
  type?.type === "TSUnionType"
    ? type.types.some((member) => namesType(member, pattern))
    : type?.type === "TSTypeReference" &&
      type.typeName.type === "Identifier" &&
      pattern.test(type.typeName.name);

const startsWithPromise = (arg) =>
  (arg?.type === "CallExpression" &&
    arg.callee.type === "MemberExpression" &&
    arg.callee.object.type === "Identifier" &&
    arg.callee.object.name === "Promise") ||
  (arg?.type === "NewExpression" &&
    arg.callee.type === "Identifier" &&
    arg.callee.name === "Promise");

const describeRef = (node) => ({
  counter: false,
  dom: namesType(typeArgument(node.init), DOM_TYPE),
  name: node.id.name,
  node,
  promise:
    namesType(typeArgument(node.init), /^Promise$/) || startsWithPromise(node.init.arguments[0]),
});

const isRefDeclaration = (node) =>
  node.init?.type === "CallExpression" &&
  isUseRef(node.init.callee) &&
  node.id.type === "Identifier";

const reportShadows = (context, refs) => {
  const shadows = refs.filter((ref) => !ref.dom);

  if (shadows.length < 2) return;

  context.report({
    data: { count: String(shadows.length), names: shadows.map((ref) => ref.name).join(", ") },
    messageId: "shadow",
    node: shadows[1].node,
  });
};

const reportRefs = (context, refs) => {
  for (const ref of refs) {
    if (ref.promise) {
      context.report({ data: { name: ref.name }, messageId: "promise", node: ref.node });
    } else if (ref.counter) {
      context.report({ data: { name: ref.name }, messageId: "counter", node: ref.node });
    }
  }

  reportShadows(context, refs);
};

const trackRefs = (context) => {
  const frames = [];

  const findRef = (name) => frames.findLast((frame) => frame.has(name))?.get(name) ?? null;

  const markCounter = (target) => {
    if (
      target.type !== "MemberExpression" ||
      target.computed ||
      target.property.type !== "Identifier" ||
      target.property.name !== "current" ||
      target.object.type !== "Identifier"
    ) {
      return;
    }

    const ref = findRef(target.object.name);

    if (ref) ref.counter = true;
  };

  const enter = () => frames.push(new Map());
  const exit = () => reportRefs(context, [...frames.pop().values()]);

  return {
    ArrowFunctionExpression: enter,
    "ArrowFunctionExpression:exit": exit,
    AssignmentExpression(node) {
      if (node.operator === "+=" || node.operator === "-=") markCounter(node.left);
    },
    FunctionDeclaration: enter,
    "FunctionDeclaration:exit": exit,
    FunctionExpression: enter,
    "FunctionExpression:exit": exit,
    UpdateExpression(node) {
      markCounter(node.argument);
    },
    VariableDeclarator(node) {
      if (!isRefDeclaration(node) || frames.length === 0) return;

      frames.at(-1).set(node.id.name, describeRef(node));
    },
  };
};

module.exports = {
  create(context) {
    return TEST_FILE.test(context.filename ?? context.getFilename()) ? {} : trackRefs(context);
  },
  meta: {
    docs: {
      description:
        "Disallow refs that queue, count or shadow writes instead of locking the control while its save is in flight",
    },
    messages: {
      counter:
        'The "{{name}}" ref counts something across renders. A count of writes in flight means writes overlap. Lock the control while its save is in flight and let the store say when it landed.',
      promise:
        'The "{{name}}" ref holds a Promise, so writes chain behind each other and a second edit races the first. Lock the control while its save is in flight and unlock it when the store shows the saved value.',
      shadow:
        "{{count}} non-DOM refs in one function ({{names}}) mirror state the render cannot see. Lock the control while saving and read the saved value from the store.",
    },
    type: "problem",
  },
};

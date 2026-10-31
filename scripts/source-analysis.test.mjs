import assert from "node:assert/strict";
import { test } from "node:test";
import { assert as assertProperty, constantFrom, property, uniqueArray } from "fast-check";

import { objectShapes, visitSource } from "./source-analysis.mjs";

test("object shapes ignore formatting and property order, preserving readonly, optional and literals", () => {
  const source = `
    type First = { a: string; b: number };
    interface Second { b: number; a: string }
    type Optional = { a?: string; b: number };
    type Readonly = { readonly a: string; b: number };
    type Literal = { a: 'a b'; b: number };
    type OtherLiteral = { a: 'ab'; b: number };
    type Generic<T> = { a: T; b: number };
    interface Derived extends Second { a: string; b: number }
  `;
  const shapes = objectShapes("sample.ts", source);

  assert.equal(shapes.length, 6);

  assert.equal(shapes[0].signature, shapes[1].signature);

  assert.equal(new Set(shapes.map((shape) => shape.signature)).size, 5);

  assert.equal(shapes[0].line, 2);
});

test("invalid syntax fails instead of reporting a clean analysis", () => {
  assert.throws(() => visitSource("bad.ts", "export const =", {}), /Cannot parse bad.ts/);
});

const shape = (names) => {
  const fields = names.map((name) => `${name}: string`).join(";");

  return objectShapes("sample.ts", `type Shape = { ${fields} }`)[0].signature;
};

test("property order does not change an object shape", () => {
  const keys = uniqueArray(constantFrom("a", "b", "c", "d"), { minLength: 2 });

  assertProperty(
    property(keys, (names) => {
      assert.equal(shape(names), shape(names.toReversed()));
    }),
  );
});

import { describe, expect, it } from "vitest";

import { GreetController } from "@/controllers/greet.controller";

describe("GreetController", () => {
  it("answers with the greeting", () => {
    expect(new GreetController().show({ name: "Ann" })).toStrictEqual({ message: "Hello, Ann" });
  });
});

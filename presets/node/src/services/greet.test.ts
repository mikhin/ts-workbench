import { describe, expect, it } from "vitest";

import { greet } from "@/services/greet";

describe("greet", () => {
  it("greets by name", () => {
    expect(greet("Ann")).toBe("Hello, Ann");
  });
});

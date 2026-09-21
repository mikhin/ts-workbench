import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hello } from "@/components/hello";

describe("Hello", () => {
  it("renders the greeting as a heading", () => {
    render(<Hello name="Ann" />);

    expect(screen.getByRole("heading")).toHaveTextContent("Hello, Ann");
  });
});

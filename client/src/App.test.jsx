import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";


describe("App home scren", () => {
  it("Red tetirs must be displayed", () => {
    render(<App />);
    expect(screen.getByText("Red Tetris")).toBeVisible();
  });
});

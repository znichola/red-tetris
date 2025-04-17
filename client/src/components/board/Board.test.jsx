import { describe, it, expect } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Grid, Keypad } from "./Board.jsx";
import { mockGrid } from "./mockGrid.js";
import { vi } from "vitest";
import { act } from "react";

describe("Board view", () => {
  it("should have a 10 x 20 grid visible", () => {
    const { container } = render(<Grid grid={mockGrid} />);

    const rows = container.getElementsByClassName("line");
    expect(rows.length).toBe(20);

    const firstRowCells = rows[0].getElementsByClassName("cell");
    expect(firstRowCells.length).toBe(10);
  });

  it("should have 8 colors for tetromino blocks", () => {
    const { container } = render(<Grid grid={mockGrid} />);

    const allCells = container.getElementsByClassName("cell");

    const bgColors = new Set();
    for (let cell of allCells) {
      const style = window.getComputedStyle(cell);
      const bg = style.backgroundColor;
      if (bg) {
        bgColors.add(bg);
      }
    }

    expect(bgColors.size).toBe(8);
  });

  it("should have 5 action buttons visile", () => {
    const { container } = render(<Grid grid={mockGrid} />);

    const rows = container.getElementsByClassName("move-btn");
    expect(rows.length).toBe(5);
  });

  it("should print action when buttons are clicked", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { container } = render(<Keypad />);

    fireEvent.click(container.querySelector(".up"));
    expect(consoleSpy).toHaveBeenCalledWith("up");

    fireEvent.click(container.querySelector(".down"));
    expect(consoleSpy).toHaveBeenCalledWith("down");

    fireEvent.click(container.querySelector(".left"));
    expect(consoleSpy).toHaveBeenCalledWith("left");

    fireEvent.click(container.querySelector(".right"));
    expect(consoleSpy).toHaveBeenCalledWith("right");

    fireEvent.click(container.querySelector(".space"));
    expect(consoleSpy).toHaveBeenCalledWith("space");

    consoleSpy.mockRestore();
  });

  it("should print action when shortcuts are used", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    render(<Keypad />);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    act(() => {
      fireEvent.keyDown(document, { code: "KeyW" });
    });
    expect(consoleSpy).toHaveBeenCalledWith("up");

    act(() => {
      fireEvent.keyDown(document, { code: "ArrowDown" });
    });
    expect(consoleSpy).toHaveBeenCalledWith("down");

    act(() => {
      fireEvent.keyDown(document, { code: "KeyA" });
    });
    expect(consoleSpy).toHaveBeenCalledWith("left");

    act(() => {
      fireEvent.keyDown(document, { code: "KeyD" });
    });
    expect(consoleSpy).toHaveBeenCalledWith("right");

    act(() => {
      fireEvent.keyDown(document, { code: "Space" });
    });
    expect(consoleSpy).toHaveBeenCalledWith("space");

    consoleSpy.mockRestore();
  });
});

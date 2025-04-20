import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Grid, Keypad } from "./Board.jsx";
import { mockGrid } from "./mockGrid.js";
import { act } from "react";
import { ActionType, SocketEvents } from "../../../../shared/DTOs.js";

import { socket } from "../../socket.js";
vi.mock("../../socket.js", () => ({
  socket: {
    emit: vi.fn(),
  },
}));

describe("Board view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("should have 5 action buttons visible", () => {
    const { container } = render(<Grid grid={mockGrid} />);

    const rows = container.getElementsByClassName("move-btn");
    expect(rows.length).toBe(5);
  });

  it("should emit socket action when buttons are clicked", () => {
    const { container } = render(<Keypad />);

    fireEvent.click(container.querySelector(".left"));
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.MoveLeft,
    );

    fireEvent.click(container.querySelector(".right"));
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.MoveRight,
    );

    fireEvent.click(container.querySelector(".up"));
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.Rotate,
    );

    fireEvent.click(container.querySelector(".down"));
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.SoftDrop,
    );

    fireEvent.click(container.querySelector(".space"));
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.HardDrop,
    );
  });

  it("should emit socket action when shortcuts are used", () => {
    render(<Keypad />);

    act(() => {
      fireEvent.keyDown(document, { code: "KeyA" });
    });
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.MoveLeft,
    );

    act(() => {
      fireEvent.keyDown(document, { code: "KeyD" });
    });
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.MoveRight,
    );

    act(() => {
      fireEvent.keyDown(document, { code: "KeyW" });
    });
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.Rotate,
    );

    act(() => {
      fireEvent.keyDown(document, { code: "ArrowDown" });
    });
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.SoftDrop,
    );

    act(() => {
      fireEvent.keyDown(document, { code: "Space" });
    });
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.HardDrop,
    );
  });
});

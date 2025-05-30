import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Grid, Keypad } from "./Board.jsx";
import { mockGrid } from "./mockGrid.js";
import { act } from "react";
import { ActionType, CellType, SocketEvents } from "../../../../shared/DTOs.js";

import { socket } from "../../socket.js";
vi.mock("../../socket.js", () => ({
  socket: {
    emit: vi.fn(),
    connected: true,
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

  it("should display all cell types with different colors", () => {
    const { container } = render(<Grid grid={mockGrid} />);

    const allCells = container.getElementsByClassName("cell");

    const tetClasses = new Set();
    for (let cell of allCells) {
      const classList = Array.from(cell.classList);
      const tetClass = classList.find((cls) => cls.startsWith("tet-"));
      if (tetClass) {
        tetClasses.add(tetClass);
      }
    }

    expect(tetClasses.size).toBe(
      Object.values(CellType).filter((v) => v !== CellType.None).length,
    );
  });

  it("should have 5 action buttons visible", () => {
    const { container } = render(<Grid grid={mockGrid} />);

    const rows = container.getElementsByClassName("move-btn");
    expect(rows.length).toBe(5);
  });

  it("should emit socket action when buttons are clicked", () => {
    const { container } = render(<Keypad />);
    /** @param {string} buttonClass */
    const clickButton = (buttonClass) => {
      const button = container.querySelector(`.${buttonClass}`);

      if (!button) {
        throw new Error(`Expected '.${buttonClass}' element to be in the DOM`);
      }

      fireEvent.click(button);
    };

    clickButton("left");
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.MoveLeft,
    );

    clickButton("right");
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.MoveRight,
    );

    clickButton("up");
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.Rotate,
    );

    clickButton("down");
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GameAction,
      ActionType.SoftDrop,
    );

    clickButton("space");
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

  it("should only emit when connected", () => {
    render(<Keypad />);
    socket.connected = false;
    act(() => {
      fireEvent.keyDown(document, { code: "Space" });
    });
    expect(socket.emit).toHaveBeenCalledTimes(0);
  });
});

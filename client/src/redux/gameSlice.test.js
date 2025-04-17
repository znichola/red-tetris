import { describe, it, expect } from "vitest";
import gameReducer, { replaceGrid, selectGrid } from "./gameSlice.js";
import { CellType } from "../../../shared/DTOs.js";

describe("gameSlice", () => {
  const createEmptyGrid = () =>
    Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => CellType.Empty),
    );

  it("should handle replaceGrid", () => {
    const initialState = {
      grid: createEmptyGrid(),
    };

    const newGrid = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => CellType.I),
    );

    const nextState = gameReducer(initialState, replaceGrid(newGrid));
    expect(nextState.grid).toEqual(newGrid);
  });

  it("selectGrid should return the grid from state", () => {
    const testGrid = [[CellType.I]];
    const state = {
      game: {
        grid: testGrid,
      },
    };

    const result = selectGrid(state);
    expect(result).toBe(testGrid);
  });
});

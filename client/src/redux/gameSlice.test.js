import { describe, it, expect } from "vitest";
import gameReducer, { replaceGrid, selectGame } from "./gameSlice.js";
import { CellType } from "../../../shared/DTOs.js";
import { initiaStoreState } from "./store.js";

describe("gameSlice", () => {
  const createEmptyGrid = () =>
    Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => CellType.Empty),
    );

  it("should handle replaceGrid", () => {
    const initialState = {
      grid: createEmptyGrid(),
      playerInfo: [],
      score: 0,
    };

    const newGrid = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => CellType.I),
    );

    const nextState = gameReducer(initialState, replaceGrid(newGrid));
    expect(nextState.grid).toEqual(newGrid);
  });

  it("selectGame should return the grid from state", () => {
    const testGrid = [[CellType.I]];
    const state = {
      ...initiaStoreState,
      game: {
        grid: testGrid,
        playerInfo: [{ player: "JARED", spectra: [0, 2, 3, 1, 0] }],
        score: 0,
      },
    };

    const result = selectGame(state);
    expect(result).toBe(state.game);
  });

  it("selectGame");
});

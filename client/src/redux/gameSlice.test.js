import { describe, it, expect } from "vitest";
import gameReducer, { replaceGrid, selectGame } from "./gameSlice.js";
import { CellType } from "../../../shared/DTOs.js";
import { initiaStoreState } from "./store.js";
import { GameGridDimensions } from "../../../server/TetrisConsts.js";

describe("gameSlice", () => {
  const createEmptyGrid = () =>
    Array.from({ length: GameGridDimensions.y }, () =>
      Array.from({ length: GameGridDimensions.x }, () => CellType.Empty),
    );

  it("should handle replaceGrid", () => {
    const initialState = {
      grid: createEmptyGrid(),
      playerNameToSpectrum: {},
    };

    const newGrid = Array.from({ length: GameGridDimensions.y }, () =>
      Array.from({ length: GameGridDimensions.x }, () => CellType.I),
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
        playerNameToSpectrum: { JARED: [0, 2, 3, 1, 0] },
      },
    };

    const result = selectGame(state);
    expect(result).toBe(state.game);
  });

  it("selectGame");
});

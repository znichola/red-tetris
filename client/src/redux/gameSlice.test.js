import { describe, it, expect } from "vitest";
import gameReducer, { initialState, replaceGameData, selectGame } from "./gameSlice.js";
import { CellType } from "../../../shared/DTOs.js";
import { initiaStoreState } from "./store.js";
import { DefaultGameGridDimensions } from "../../../shared/Consts.js";

describe("gameSlice", () => {
  it("should handle replaceGrid", () => {
    const withNewGrid = {
      ...initialState,
      grid: Array.from({ length: DefaultGameGridDimensions.y }, () =>
        Array.from({ length: DefaultGameGridDimensions.x }, () => CellType.I),
      ),
    };

    const nextState = gameReducer(initialState, replaceGameData(withNewGrid));
    expect(nextState).toEqual(withNewGrid);
  });

  it("selectGame should return the grid from state", () => {
    const state = {
      ...initiaStoreState,
      game: {
        grid: [[CellType.I]],
        playerNameToSpectrum: { JARED: [0, 2, 3, 1, 0] },
        score: 0,
        nextTetromino: undefined,
      },
    };

    const result = selectGame(state);
    expect(result).toBe(state.game);
  });

  it("selectGame");
});

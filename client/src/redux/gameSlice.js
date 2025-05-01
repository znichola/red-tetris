import { createSlice } from "@reduxjs/toolkit";
import { CellType, GameState } from "../../../shared/DTOs.js";
import { resetAll } from "./hooks.js";

// https://redux.js.org/tutorials/essentials/part-2-app-structure#creating-slice-reducers-and-actions

/**
 * @typedef {number[]} Spectra
 *
 * @typedef {{
 *     player: string;
 *     spectra: Spectra;
 * }} PlayerInfo
 */

/**
 * Define the initial value for the slice state
 */
export const initialState = {
  /** @type {CellType[][]} */ grid: Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => CellType.Empty),
  ),
  score: 0,
  /**@type {PlayerInfo[]} */ playerInfo: [],
};

/**
 * Slices contain Redux reducer logic for updating state, and
 * generate actions that can be dispatched to trigger those updates.
 */
export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<CellType[][]>} action
     */
    replaceGrid: (state, action) => {
      // "Mutating" state because immer is used to properly create a new object each time.
      state.grid = action.payload;
    },
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<number>} action
     */
    replaceScore: (state, action) => {
      // "Mutating" state because immer is used to properly create a new object each time.
      state.score = action.payload;
    },
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<PlayerInfo[]>} action
     */
    replaceSpectra: (state, action) => {
      state.playerInfo = action.payload;
    },
  },
  extraReducers: (builder) => builder.addCase(resetAll, () => initialState),
});

export const { replaceGrid, replaceScore, replaceSpectra } = gameSlice.actions;

export const selectGame = (
  /**@type {import("./store.js").RootState} */ state,
) => state.game;

export default gameSlice.reducer;

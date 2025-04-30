import { createSlice } from "@reduxjs/toolkit";
import { CellType } from "../../../shared/DTOs.js";
import { resetAll } from "./hooks.js";

// https://redux.js.org/tutorials/essentials/part-2-app-structure#creating-slice-reducers-and-actions

/**
 * @typedef {import("../../../shared/DTOs.js").PlayerNameToSpectrum} PlayerNameToSpectrum
 */

/**
 * Define the initial value for the slice state
 */
export const initialState = {
  /** @type {CellType[][]} */ grid: Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => CellType.Empty),
  ),
  /**@type {PlayerNameToSpectrum} */ playerNameToSpectrum: {},
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
     * @param {import("@reduxjs/toolkit").PayloadAction<PlayerNameToSpectrum>} action
     */
    replacePlayerNameToSpectrum: (state, action) => {
      state.playerNameToSpectrum = action.payload;
    },
  },
  extraReducers: (builder) => builder.addCase(resetAll, () => initialState),
});

export const { replaceGrid, replacePlayerNameToSpectrum } = gameSlice.actions;

export const selectGame = (
  /**@type {import("./store.js").RootState} */ state,
) => state.game;

export default gameSlice.reducer;

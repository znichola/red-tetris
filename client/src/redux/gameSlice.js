import { createSlice } from "@reduxjs/toolkit";
import { CellType, GameState } from "../../../shared/DTOs.js";
import { resetAll } from "./hooks.js";

// https://redux.js.org/tutorials/essentials/part-2-app-structure#creating-slice-reducers-and-actions

/**
 * Define the initial value for the slice state
 */
export const /**@type {import("../../../shared/DTOs.js").GameData} */ initialState =
    {
      grid: Array.from({ length: 20 }, () =>
        Array.from({ length: 10 }, () => CellType.Empty),
      ),
      score: 0,
      playerNameToSpectrum: {},
      nextTetromino: undefined,
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
     * @param {import("@reduxjs/toolkit").PayloadAction<import("../../../shared/DTOs.js").GameData>} action
     */
    replaceGameData: (state, action) => {
      // "Mutating" state because immer is used to properly create a new object each time.
      state.grid = action.payload.grid;
      state.playerNameToSpectrum = action.payload.playerNameToSpectrum;
      state.score = action.payload.score;
      state.nextTetromino = action.payload.nextTetromino;
    },
  },
  extraReducers: (builder) => builder.addCase(resetAll, () => initialState),
});

export const { replaceGameData } = gameSlice.actions;

export const selectGame = (
  /**@type {import("./store.js").RootState} */ state,
) => state.game;

// This cannont be done in select, it's a funciton that should not return ref to a new object
export const convertSpectaToArray = (
  /**@type {import("../../../shared/DTOs.js").PlayerNameToSpectrum} */ playerNameToSpectrum,
) =>
  Object.entries(playerNameToSpectrum).map((e) => {
    return { player: e[0], spectra: e[1] };
  });

export default gameSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { CellType } from "../../../shared/DTOs.js";

// https://redux.js.org/tutorials/essentials/part-2-app-structure#creating-slice-reducers-and-actions

/**
 * Define the initial value for the slice state
 */
const initialState = {
  /** @type {CellType[][]} */ board: Array.from({ length: 20 }, () =>
    Array.from({ length: 10 }, () => CellType.Empty),
  ),
};

/**
 * Slices contain Redux reducer logic for updating state, and
 * generate actions taht can be dispatched to trigger those updates.
 */
export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<CellType[][]>} action
     */
    replaceBoard: (state, action) => {
      // "Mutating" state becasue immer is used to propery create a new object each time.
      state.board = action.payload;
    },
  },
});

export const { replaceBoard } = gameSlice.actions;

export const selectBoard = (
  /**@type {import("./store.js").RootState} */ state,
) => state.game.board;

export default gameSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { resetAll } from "./hooks.js";

export const initialState = {
  isConnected: false,
};

export const roomSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<boolean>} action
     */
    setIsSocketConnected: (state, action) => {
      // "Mutating" state because immer is used to properly create a new object each time.
      state.isConnected = action.payload;
    },
  },
  extraReducers: (builder) => builder.addCase(resetAll, () => initialState),
});

export const { setIsSocketConnected } = roomSlice.actions;

export const selectSocket = (
  /**@type {import("./store.js").RootState} */ state,
) => state.socket;

export default roomSlice.reducer;

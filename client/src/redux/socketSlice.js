import { createSlice } from "@reduxjs/toolkit";

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
      // "Mutating" state because immer is used to propery create a new object each time.
      state.isConnected = action.payload;
    },
  },
});

export const { setIsSocketConnected } = roomSlice.actions;

export const selectSocket = (
  /**@type {import("./store.js").RootState} */ state,
) => state.socket;

export default roomSlice.reducer;

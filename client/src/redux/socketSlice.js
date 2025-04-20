import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isConnected: false,
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<boolean>} action
     */
    setIsSocketConnected: (state, action) => {
      // "Mutating" state becasue immer is used to propery create a new object each time.
      state.isConnected = action.payload;
    },
  },
});

export const { setIsSocketConnected } = roomSlice.actions;

export const selectSocket = (
  /**@type {import("./store.js").RootState} */ state,
) => state.socket;

export default roomSlice.reducer;

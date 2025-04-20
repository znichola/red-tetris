import { createSlice } from "@reduxjs/toolkit";

/** @typedef {import("../../../shared/DTOs.js").RoomData} RoomData */

const initialState = {
  /**@type {RoomData | null} */ data: null,
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<RoomData>} action
     */
    replaceRoom: (state, action) => {
      // "Mutating" state becasue immer is used to propery create a new object each time.
      state.data = action.payload;
    },
  },
});

export const { replaceRoom } = roomSlice.actions;

export const selectRoom = (
  /**@type {import("./store.js").RootState} */ state,
) => state.room.data;

export default roomSlice.reducer;

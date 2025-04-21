import { createSlice } from "@reduxjs/toolkit";
import { resetAll } from "./hooks.js";

/** @typedef {import("../../../shared/DTOs.js").RoomData} RoomData */

export const initialState = {
  /**@type {RoomData | null} */ data: null,
  isRoomAdmin: false,
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<RoomData>} action
     */
    replaceRoom: (state, action) => {
      // "Mutating" state because immer is used to propery create a new object each time.
      state.data = action.payload;
    },
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<string>} action
     * */
    setIsRoomAdmin: (state, action) => {
      state.isRoomAdmin = state.data?.ownerName == action.payload;
    },
  },
  extraReducers: (builder) => builder.addCase(resetAll, () => initialState),
});

export const { replaceRoom, setIsRoomAdmin } = roomSlice.actions;

export const selectRoom = (
  /**@type {import("./store.js").RootState} */ state,
) => state.room;

export default roomSlice.reducer;

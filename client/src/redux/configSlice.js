// src/redux/gameConfigSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { DefaultGameGridDimensions } from "../../../shared/Consts.js";
import { resetAll } from "./hooks.js";

/** @typedef {import("../../../shared/DTOs.js").GameConfig} GameConfigClient */

/** @type {GameConfigClient} */
export const initialState = {
  dim: { ...DefaultGameGridDimensions },
  heavy: false,
  battle: false,
  base: "classic",
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setGridX: (state, action) => {
      state.dim.x = action.payload;
    },
    setGridY: (state, action) => {
      state.dim.y = action.payload;
    },
    setHeavy: (state, action) => {
      state.heavy = action.payload;
    },
    setBattle: (state, action) => {
      state.battle = action.payload;
    },
    setBase: (state, action) => {
      state.base = action.payload;
    },
    setFullConfig: (state, action) => {
      Object.assign(state, action.payload);
    },
  },
  extraReducers: (builder) => builder.addCase(resetAll, () => initialState),
});

export const {
  setGridX,
  setGridY,
  setHeavy,
  setBattle,
  setBase,
  setFullConfig,
} = configSlice.actions;

export const selectGameConfig = (
  /** @type {import("./store.js").RootState} */ state,
) => state.config;

export default configSlice.reducer;

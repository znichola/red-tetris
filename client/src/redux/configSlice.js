// src/redux/gameConfigSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { DefaultGameGridDimensions } from "../../../shared/Consts.js";
import { resetAll } from "./hooks.js";
import { PowerUpCellType, RulesetType } from "../../../shared/DTOs.js";

/** @typedef {import("../../../shared/DTOs.js").GameConfig} GameConfig */

/** @type {GameConfig} */
export const initialState = {
  gridDimensions: { ...DefaultGameGridDimensions },
  heavy: false,
  ruleset: RulesetType.Classic,
  enabledPowerUps: [],
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setGridX: (state, action) => {
      state.gridDimensions.x = action.payload;
    },
    setGridY: (state, action) => {
      state.gridDimensions.y = action.payload;
    },
    setHeavy: (state, action) => {
      state.heavy = action.payload;
    },
    setRuleset: (state, action) => {
      state.ruleset = action.payload;
      if (action.payload === RulesetType.PowerUp) {
        state.enabledPowerUps = Object.values(PowerUpCellType);
      } else {
        state.enabledPowerUps = [];
      }
    },
    setEnabledPowerUps: (state, action) => {
      state.enabledPowerUps = action.payload;
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
  setRuleset,
  setEnabledPowerUps,
  setFullConfig,
} = configSlice.actions;

export const selectGameConfig = (
  /** @type {import("./store.js").RootState} */ state,
) => state.config;

export default configSlice.reducer;

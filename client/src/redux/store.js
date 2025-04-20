import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice.js";
import roomReducer from "./roomSlice.js";
import socketReducer from "./socketSlice.js";

// https://redux.js.org/tutorials/essentials/part-2-app-structure#creating-the-redux-store

export const store = configureStore({
  reducer: {
    // WE have a game component in the app state, and
    // gameReducer is in charge of modifying this state
    game: gameReducer,
    room: roomReducer,
    socket: socketReducer,
  },
});

/**
 * Infer the type of the store
 * @typedef {typeof store} AppStore
 * @typedef {ReturnType<AppStore['getState']>} RootState
 */

/**
 * Infer the 'AppDispatch' type from the store it's self
 * @typedef {AppStore['dispatch']} AppDispatch
 */

/**
 * Define a reusable type describing thunk functions
 * @template ThunkReturnType
 * @typedef {import('@reduxjs/toolkit').ThunkAction<
 *   ThunkReturnType,
 *   RootState,
 *   unknown,
 *   import('@reduxjs/toolkit').Action
 * >} AppThunk
 */

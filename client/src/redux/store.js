import { configureStore } from "@reduxjs/toolkit";
import gameReducer, { initialState as initialGameState } from "./gameSlice.js";
import roomReducer, { initialState as initialRoomState } from "./roomSlice.js";
import socketReducer, {
  initialState as initialSocketState,
} from "./socketSlice.js";

// https://redux.js.org/tutorials/essentials/part-2-app-structure#creating-the-redux-store

// reset all reducers
// https://stackoverflow.com/questions/59424523/reset-state-to-initial-with-redux-toolkit

export const initiaStoreState = {
  game: initialGameState,
  room: initialRoomState,
  socket: initialSocketState,
};

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

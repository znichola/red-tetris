// https://redux.js.org/tutorials/essentials/part-2-app-structure#defining-pre-typed-react-redux-hooks

import { createAction } from "@reduxjs/toolkit";

/**
 * @typedef {import('./store.js').AppDispatch} AppDispatch
 * @typedef {import('./store.js').RootState} RootState
 */

// // Use throughout your app instead of plain `useDispatch` and `useSelector`
// export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
// export const useAppSelector = useSelector.withTypes<RootState>()

// TODO : figureout how to properly convert this to JSDocs, if it's actually needed,
//        so far it seems ok to not use these convenience typed functions

export const resetAll = createAction("RESET_ALL");

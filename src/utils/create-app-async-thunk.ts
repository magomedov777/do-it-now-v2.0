import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootStateType } from "app/store";

/**
 * Create an async thunk for the app.
 *
 * @template {Object} TState - The type of the state.
 * @template {Function} TDispatch - The type of the dispatch function.
 * @returns {AsyncThunk<null, void, { state: TState, dispatch: TDispatch, rejectValue: null }>} The async thunk for the app.
 */

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppRootStateType;
  dispatch: AppDispatch;
  rejectValue: null;
}>();

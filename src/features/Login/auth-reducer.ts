import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appActions } from "app/app-reducer";
import { todolistsActions } from "features/TodolistsList/Todolist/todolists-reducer";
import { tasksActions } from "features/TodolistsList/tasks/tasks-reducer";
import { createAppAsyncThunk } from "utils/create-app-async-thunk";
import { thunkTryCatch } from "utils/thunk-try-catch";
import { authAPI, LoginParamsType } from "api/auth-api";
import { handleServerAppError } from "utils/handle-server-app-error";

const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>("auth/login", async (arg, thunkAPI) => {
  return thunkTryCatch(thunkAPI, async () => {
    let res = await authAPI.login(arg);
    if (res.data.resultCode === 0) {
      return { isLoggedIn: true };
    } else {
      let isShowError = !res.data.messages.length;
      handleServerAppError(res.data, thunkAPI.dispatch, isShowError);
      return thunkAPI.rejectWithValue(null);
    }
  });
});

const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, void>("auth/logout", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  return thunkTryCatch(thunkAPI, async () => {
    let res = await authAPI.logout();
    if (res.data.resultCode === 0) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      dispatch(todolistsActions.logOutTodoReducer());
      dispatch(tasksActions.logOutTaskReducer());
      return { isLoggedIn: false };
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  });
});

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn;
      });
  },
});

export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunks = { login, logout };

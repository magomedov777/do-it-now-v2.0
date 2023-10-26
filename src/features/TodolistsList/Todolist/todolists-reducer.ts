import { todolistAPI, TodolistType } from "api/todolists-api";
import { appActions, RequestStatusType } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "utils/create-app-async-thunk";
import { thunkTryCatch } from "utils/thunk-try-catch";
import { handleServerAppError } from "utils/handle-server-app-error";
import { ResultCode } from "utils";

const fetchTodoLists = createAppAsyncThunk<{ todolists: TodolistType[] }>("todo/fetchTodos", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI;
  return thunkTryCatch(thunkAPI, async () => {
    const res = await todolistAPI.getTodolists();
    dispatch(appActions.setAppStatus({ status: "succeeded" }));
    return { todolists: res.data };
  });
});

const removeTodolist = createAppAsyncThunk<{ todolistId: string }, { todolistId: string }>(
  "todo/removeTodos",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(todolistsActions.changeTodolistEntityStatus({ id: arg.todolistId, status: "loading" }));
    dispatch(appActions.setAppStatus({ status: "loading" }));
    return thunkTryCatch(thunkAPI, async () => {
      let res = await todolistAPI.deleteTodolist(arg.todolistId);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { todolistId: arg.todolistId };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    });
  }
);

const addTodoList = createAppAsyncThunk<{ todolist: TodolistType }, { title: string }>(
  "todo/addTodo",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
      const res = await todolistAPI.createTodolist(arg.title);
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return { todolist: res.data.data.item };
    });
  }
);

const changeTodolistTitle = createAppAsyncThunk<{ id: string; title: string }, { id: string; title: string }>(
  "todo/changeTodoTitle",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
      let res = await todolistAPI.updateTodolist(arg.id, arg.title);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { id: arg.id, title: arg.title };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    });
  }
);

const initialState: Array<TodolistDomainType> = [];

const slice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
      const index = state.findIndex((tl) => tl.id === action.payload.id);
      if (index !== -1) state.splice(index, 1);
    },
    addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" });
    },
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      return state.map((tl) => (tl.id === action.payload.id ? { ...tl, filter: action.payload.filter } : tl));
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
      return state.map((tl) => (tl.id === action.payload.id ? { ...tl, entityStatus: action.payload.status } : tl));
    },
    setTodolists: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
      return action.payload.todolists?.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
    },
    logOutTodoReducer: (state) => {
      return (state = []);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(todoListsThunks.fetchTodoLists.fulfilled, (state, action) => {
        return action.payload.todolists?.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
      })
      .addCase(todoListsThunks.removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((tl) => tl.id === action.payload.todolistId);
        if (index !== -1) state.splice(index, 1);
      })
      .addCase(todoListsThunks.addTodoList.fulfilled, (state, action) => {
        state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" });
      })
      .addCase(todoListsThunks.changeTodolistTitle.fulfilled, (state, action) => {
        return state.map((tl) => (tl.id === action.payload.id ? { ...tl, title: action.payload.title } : tl));
      });
  },
});

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todoListsThunks = { fetchTodoLists, removeTodolist, addTodoList, changeTodolistTitle };

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};

import { appActions } from "app/app-reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { todolistsActions } from "features/TodolistsList/Todolist/todolists-reducer";
import { createAppAsyncThunk } from "utils/create-app-async-thunk";
import { thunkTryCatch } from "utils/thunk-try-catch";
import { taskAPI, TaskType, UpdateTaskModelType, UpdateTaskType } from "api/task-api";
import { handleServerAppError } from "utils/handle-server-app-error";
import { ResultCode, TaskPriorities, TaskStatuses } from "utils";

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  "tasks/fetchTasks",
  async (todolistId: string, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await taskAPI.getTasks(todolistId);
      const tasks = res.data.items;
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return { todolistId, tasks };
    });
  }
);

const addTask = createAppAsyncThunk<{ task: TaskType }, { title: string; todolistId: string }>(
  "tasks/addTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
      const res = await taskAPI.createTask(arg.todolistId, arg.title);
      if (res.data.resultCode === ResultCode.Success) {
        const task = res.data.data.item;
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { task };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    });
  }
);

const updateTask = createAppAsyncThunk<UpdateTaskType, UpdateTaskType>("tasks/updateTask", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue, getState } = thunkAPI;
  return thunkTryCatch(thunkAPI, async () => {
    const state = getState();
    const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
    if (!task) {
      console.warn("task not found in the state");
      return rejectWithValue(null);
    }
    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.model,
    };
    const res = await taskAPI.updateTask(arg.todolistId, arg.taskId, apiModel);
    if (res.data.resultCode === ResultCode.Success) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return arg;
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  });
});

const removeTask = createAppAsyncThunk<{ taskId: string; todolistId: string }, { taskId: string; todolistId: string }>(
  "tasks/removeTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    return thunkTryCatch(thunkAPI, async () => {
      const res = await taskAPI.deleteTask(arg.todolistId, arg.taskId);
      if (res.data.resultCode === ResultCode.Success) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { taskId: arg.taskId, todolistId: arg.todolistId };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    });
  }
);

const initialState: TasksStateType = {};
const slice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTodos: (state, action: PayloadAction<{ id: string }>) => {
      state[action.payload.id] = [];
    },
    clearTodoState: (state, action: PayloadAction<{ id: string }>) => {
      state[action.payload.id] = [];
    },
    logOutTaskReducer: (state) => {
      return (state = {});
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(tasksThunks.fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks;
      })
      .addCase(tasksThunks.addTask.fulfilled, (state, action) => {
        state[action.payload.task.todoListId].unshift(action.payload.task);
      })
      .addCase(tasksThunks.updateTask.fulfilled, (state, action) => {
        state[action.payload.todolistId] = state[action.payload.todolistId].map((t) =>
          t.id === action.payload.taskId ? { ...t, ...action.payload.model } : t
        );
      })
      .addCase(tasksThunks.removeTask.fulfilled, (state, action) => {
        state[action.payload.todolistId] = state[action.payload.todolistId].filter(
          (t) => t.id != action.payload.taskId
        );
      })
      .addCase(todolistsActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        delete state[action.payload.id];
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((td) => {
          state[td.id] = [];
        });
      });
  },
});

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask };

export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};

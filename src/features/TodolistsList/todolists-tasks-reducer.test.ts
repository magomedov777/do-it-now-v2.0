import {
  TodolistDomainType,
  todolistsActions,
  todolistsReducer,
} from "features/TodolistsList/Todolist/todolists-reducer";
import { tasksReducer } from "features/TodolistsList/tasks/tasks-reducer";
import { TodolistType } from "api/todolists-api";
import { TasksStateType } from "./tasks/Task";

test("ids should be equals", () => {
  const startTasksState: TasksStateType = {};
  const startTodolistsState: Array<TodolistDomainType> = [];

  let todolist: TodolistType = {
    title: "new todolist",
    id: "any id",
    addedDate: "",
    order: 0,
  };

  const action = todolistsActions.addTodolist({ todolist });
  const endTasksState = tasksReducer(startTasksState, action);
  const endTodolistsState = todolistsReducer(startTodolistsState, action);
  const keys = Object.keys(endTasksState);
  const idFromTasks = keys[0];
  const idFromTodolists = endTodolistsState[0].id;

  expect(idFromTasks).toBe(action.payload.todolist.id);
  expect(idFromTodolists).toBe(action.payload.todolist.id);
});

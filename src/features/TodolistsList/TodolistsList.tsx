import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AppRootStateType } from 'app/store'
import {
    FilterValuesType,
    TodolistDomainType, todolistsActions, todoListsThunks
} from 'features/TodolistsList/Todolist/todolists-reducer'
import { tasksThunks } from 'features/TodolistsList/tasks/tasks-reducer'
import { Grid, Paper } from '@mui/material'
import { AddItemForm } from 'components/AddItemForm/AddItemForm'
import { Todolist } from './Todolist/Todolist'
import { Navigate } from 'react-router-dom'
import { useAppDispatch } from 'hooks/useAppDispatch';
import { selectIsLoggedIn, selectTasks, selectTodolists } from "app/app-selectors";
import { useActions } from "hooks/useAction";
import { TasksStateType } from './tasks/Task'

type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(selectTodolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(selectTasks)
    const isLoggedIn = useSelector<AppRootStateType, boolean>(selectIsLoggedIn)
    const dispatch = useAppDispatch()
    const { fetchTodoLists, changeTodolistTitle, removeTodolist, addTodoList } = useActions(todoListsThunks)
    const { updateTask } = useActions(tasksThunks)
    const { changeTodolistFilter } = useActions(todolistsActions)

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        fetchTodoLists()
    }, [])


    const addTask = useCallback((title: string, todolistId: string) => {
        dispatch(tasksThunks.addTask({ title, todolistId }))
    }, [])

    const changeFilter = useCallback((value: FilterValuesType, todolistId: string) => {
        changeTodolistFilter({ id: todolistId, filter: value })
    }, [])

    const removeTodoList = useCallback((todolistId: string) => {
        removeTodolist({ todolistId })
    }, [])

    const changeTodoListTitle = useCallback((id: string, title: string) => {
        changeTodolistTitle({ id, title })
    }, [])

    const addTodolist = useCallback((title: string) => {
        addTodoList({ title })
    }, [])

    if (!isLoggedIn) {
        return <Navigate to={"/login"} />
    }

    return <>
        <Grid container style={{ padding: '20px' }}>
            <AddItemForm addItem={addTodolist} />
        </Grid>
        <Grid container spacing={3}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <Paper
                            elevation={17}
                            square={false}
                            variant='elevation'
                            style={{ padding: '10px' }}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                removeTodolist={removeTodoList}
                                changeTodolistTitle={changeTodoListTitle}
                                demo={demo}
                            />
                        </Paper>
                    </Grid>
                })}
        </Grid>
    </>
}

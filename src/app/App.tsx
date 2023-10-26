import React, { FC, useCallback, useEffect } from 'react'
import './App.css'
import { TodolistsList } from 'features/TodolistsList/TodolistsList'
import { ErrorSnackbar } from 'components/ErrorSnackbar/ErrorSnackbar'
import { useSelector } from 'react-redux'
import { AppRootStateType } from './store'
import { appThunks, RequestStatusType } from './app-reducer'
import { Route, Routes } from 'react-router-dom'
import { Login } from 'features/Login/Login'
import {
	AppBar,
	Button,
	CircularProgress,
	Container,
	IconButton,
	LinearProgress,
	Toolbar,
	Typography
} from '@mui/material';
import { Menu, Title } from '@mui/icons-material'
import { selectIsInitialized, selectIsLoggedIn, selectStatus } from "app/app-selectors";
import { authThunks } from "features/Login/auth-reducer";
import { useActions } from "hooks/useAction";

type Props = {
	demo?: boolean
}

const App: FC<Props> = ({ demo = false }) => {
	const status = useSelector<AppRootStateType, RequestStatusType>(selectStatus)
	const isInitialized = useSelector<AppRootStateType, boolean>(selectIsInitialized)
	const isLoggedIn = useSelector<AppRootStateType, boolean>(selectIsLoggedIn)
	const { initializeApp } = useActions(appThunks)
	const { logout } = useActions(authThunks)

	useEffect(() => {
		initializeApp()
	}, [])

	const logoutHandler = useCallback(() => {
		logout()
	}, [])

	if (!isInitialized) {
		return <div
			style={{ position: 'fixed', top: '30%', textAlign: 'center', width: '100%' }}>
			<CircularProgress />
		</div>
	}
	return (
		<div className="App">
			<ErrorSnackbar />
			<AppBar position="static">
				<Toolbar style={{ backgroundColor: '#800080', color: '#ffd700', boxShadow: 'black 2px 2px 0 0' }}>
					<IconButton edge="start" color="inherit" aria-label="menu">
						<Menu />
					</IconButton>
					<Typography variant="h6" style={{ fontWeight: 'bold' }}>
						Menu
					</Typography>
					<p style={{
						position: 'absolute',
						marginLeft: '700px',
						fontSize: '25px',
						fontFamily: 'TimesNewRoman',
						fontWeight: 'bolder'
					}}>Do it now</p>

					{isLoggedIn && <Button style={{ marginLeft: '1350px', fontWeight: 'bold' }} color="inherit" onClick={logoutHandler}>Logout</Button>}
				</Toolbar>
				{status === 'loading' && <LinearProgress />}
			</AppBar>
			<Container fixed>
				<Routes>
					<Route path={'/'} element={<TodolistsList demo={demo} />} />
					<Route path={'/login'} element={<Login />} />
				</Routes>
			</Container>
		</div>
	)
}

export default App

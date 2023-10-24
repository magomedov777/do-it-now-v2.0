import { Dispatch } from "redux";
import { appActions } from "app/app-reducer";
import axios, { AxiosError } from "axios";

/**
 * Handle server network error and dispatch appropriate actions.
 *
 * @param {unknown} e - The error object.
 * @param {Dispatch} dispatch - The dispatch function.
 * @returns {void}
 */

export const handleServerNetworkError = (e: unknown, dispatch: Dispatch) => {
  const err = e as Error | AxiosError<{ error: string }>;
  if (axios.isAxiosError(err)) {
    const error = err.message ? err.message : "Some error occurred";
    dispatch(appActions.setAppError({ error }));
  } else {
    dispatch(appActions.setAppError({ error: `Native error ${err.message}` }));
  }
  dispatch(appActions.setAppStatus({ status: "failed" }));
};

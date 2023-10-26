import { Dispatch } from "redux";
import { appActions } from "app/app-reducer";
import { ResponseType } from "../api/common-types";

/**
 * Handle server app error based on the response data.
 *
 * @template D - The type of the response data.
 * @param {ResponseType<D>} data - The response data.
 * @param {Dispatch} dispatch - The dispatch function.
 * @param {boolean} [showError=true] - Whether to show the error or not.
 * @returns {void}
 */

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch, showError: boolean = true) => {
  if (data.messages.length) {
    dispatch(appActions.setAppError({ error: data.messages[0] }));
  } else {
    dispatch(appActions.setAppError({ error: "Some error occurred" }));
  }
  dispatch(appActions.setAppStatus({ status: "failed" }));
};

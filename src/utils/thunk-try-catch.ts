import { appActions } from "app/app-reducer";
import { handleServerNetworkError } from "./handle-server-network-error";

/**
 * Wrap thunk logic with try-catch block and handle network errors.
 *
 * @param {any} thunkApi - The thunk API object.
 * @param {Function} logic - The thunk logic function.
 * @returns {Promise<any>} A promise that resolves or rejects based on the thunk logic.
 */

export const thunkTryCatch = async (thunkApi: any, logic: () => {}): Promise<any> => {
  const { dispatch, rejectWithValue } = thunkApi;
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }));
    return logic();
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null);
  } finally {
    dispatch(appActions.setAppStatus({ status: "idle" }));
  }
};

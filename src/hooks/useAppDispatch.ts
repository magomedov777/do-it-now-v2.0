import { useDispatch } from "react-redux";
import { AppDispatch } from "../app/store";

/**
 * Custom hook to get the typed `dispatch` function from Redux.
 *
 * @returns {AppDispatch} The typed `dispatch` function.
 */

export const useAppDispatch = () => useDispatch<AppDispatch>();

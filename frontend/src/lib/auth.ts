import axios from "axios";
import { logout } from "./features/User";
import { AppDispatch } from "./store";

export const clearGs = async (dispatch: AppDispatch) => {
  console.log("in here");
  dispatch(logout());
  await axios.post(
    `https://${process.env.NEXT_PUBLIC_DOMAIN}/logout`,
    {},
    { withCredentials: true }
  );

  return;
};

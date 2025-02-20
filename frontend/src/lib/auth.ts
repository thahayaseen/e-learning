import axios from "axios";
import { setUser, logout } from "./features/User";
import { AppDispatch } from "./store";

export const checkUserAuthentication = async (dispatch: AppDispatch) => {
  const token = localStorage.getItem("access");

  if (!token) {
    dispatch(logout());
    return false;
  }

  try {
    const response = await axios.get("http://localhost:4050/autherisation", { 
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true 
    });
    if(!response.data.message.name){
      return null
    }

    dispatch(setUser(response.data.message));
    return response.data;
  } catch (error) {
    console.log(error);
    
    dispatch(logout());
    return false;
  }
};
export const clearGs=async(dispatch:AppDispatch)=>{
  console.log('in here');
  dispatch(logout())
  await axios.post("http://localhost:4050/logout", {}, { withCredentials: true });

return 
}
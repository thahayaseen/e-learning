import axios from "@/services/asios";
import { save_cookie } from "@/lib/features/cookie";
import toast from "react-hot-toast";
import { AppDispatch } from "@/lib/store";
import { loading, setUser } from "@/lib/features/User";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const loginUser = async (
  data: LoginData, 
  dispatch: AppDispatch
) => {
  try {
    dispatch(loading(true));
    const response = await axios.post("/login", data);
    toast.success(response.message || "Login successful!");
    dispatch(setUser(response.user));
    save_cookie("access", response.token);
    return { success: true, data: response };
  } catch (error: any) {
    const errorMessage = error.response.data?.message || "Login failed";
    toast.error(errorMessage);
    console.warn(errorMessage);
    return { success: false, error };
  } finally {
    dispatch(loading(false));
  }
};

export const registerUser = async (
  data: RegisterData,
  dispatch: AppDispatch
) => {
  try {
    dispatch(loading(true));
    const response = await axios.post("/signup", data);
    console.log(response);
    
    toast.success(response.message || "Registration successful!");
    
    return { success: true, data: response };
  } catch (error: any) {
    const errorMessage = error.response.data?.message || "Registration failed";
    toast.error(errorMessage);
    console.error(error);
    return { success: false, error };
  } finally {
    dispatch(loading(false));
  }
};

export const googleLogin = async (
  token: string,
  dispatch: AppDispatch
) => {
  try {
    dispatch(loading(true));
    const response = await axios.post(
      "/glogin",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success(response.message || "Google login successful!");
    dispatch(setUser(response.user));
    save_cookie("access", response.token);
    return { success: true, data: response };
  } catch (error: any) {
    console.error(error);
    return { success: false, error };
  } finally {
    dispatch(loading(false));
  }
};
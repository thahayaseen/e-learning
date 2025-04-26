import axios from "@/services/asios";
import { save_cookie } from "@/lib/features/cookie";
import toast from "react-hot-toast";
import { AppDispatch } from "@/lib/store";
import { setloading, setUser } from "@/lib/features/User";
import { signOut } from "next-auth/react";

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
    dispatch(setloading(true));
    const response = await axios.post("/login", data);
    toast.success(response.message || "Login successful!");
    dispatch(setUser(response.user));
    // save_cookie("access", response.token);
    return { success: true, data: response };
  } catch (error: any) {
    const errorMessage = error.message
    toast.error(errorMessage);
    console.warn(errorMessage);
    return
    // return { success: false, error };
  } finally {
    dispatch(setloading(false));
  }
};

export const registerUser = async (
  data: RegisterData,
  dispatch: AppDispatch
) => {
  try {
    dispatch(setloading(true));
    const response = await axios.post("/signup", data);
     toast.success(response.message || "Registration successful!");
    
    return { success: true, data: response };
  } catch (error: any) {
    const errorMessage = error.message || "Registration failed";
     toast.error(errorMessage);
    
    
    // toast.error(errorMessage);
 
    return { success: false, error };
  } finally {
    dispatch(setloading(false));
  }
};

export const googleLogin = async (
  token: string,
  dispatch: AppDispatch
) => {
  try {
    dispatch(setloading(true));
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
    // save_cookie("access", response.token);
    return { success: true, data: response };
  } catch (error: any) {
     toast.error(error.message)
    
 
    return { success: false, error };
  } finally {
    await signOut({ redirect: false })
    dispatch(setloading(false));
  }
};
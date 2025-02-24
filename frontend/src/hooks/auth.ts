"user client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { validateAuthForm } from "@/lib/vallidation/Vuser";
import { loading, setUser } from "@/lib/features/User";
import toast from "react-hot-toast";
import axios from "@/services/asios";
import { save_cookie } from "@/lib/features/cookie";

interface AuthFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
}
interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    userid: string;
  };
  user: User;
}

const useAuth = (
  isLogin: boolean,
  setCpath: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<AuthFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent,routing:string) => {
    e.preventDefault();

    // Validate form
    const errors = validateAuthForm({ ...formData, isLogin });
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    try {
      console.log('from here');
      
      dispatch(loading(true));
      const endpoint = isLogin ? "/login" : "/signup";
        console.log(formData);
        
      const response: AuthResponse = await axios.post(endpoint, 
         formData,
      );
      console.log(response);
      
      
      console.log(JSON.stringify(response));
      toast.success(response.message);
      console.log('roujafnsd',routing);
      if (isLogin) {
        if (!response || !response.user) {
          return;
        }
        console.log('loginin');
        
        dispatch(setUser(response.user))
        save_cookie('access',response.access)
        
        router.push(routing)
       
      }else{
        console.log('herhe');
        save_cookie('varifyToken',response.token)
        router.push('/auth/otp')
      }

      return;
    } catch (error) {
        console.log(error);
        
      toast.error(
        error instanceof Error ? error?.response.data.message : "Authentication failed"
      );
    } finally {
      dispatch(loading(false));
    }
  };

  

  return {
    formData,
    handleChange,
    handleSubmit,
   
  };
};
export default useAuth;

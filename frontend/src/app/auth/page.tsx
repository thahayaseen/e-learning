"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/asios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch,useSelector } from "react-redux";
import { loading } from "@/lib/features/User";
import { clearGs } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { setUser } from "@/lib/features/User";
import { useSession, signIn, signOut } from "next-auth/react";
import { checkUserAuthentication } from "@/lib/auth";

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    userid: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

import { Eye, EyeOff, Mail, Lock, Globe, User } from "lucide-react";

import toast from "react-hot-toast";
// import { storeType } from "@/lib/store";
import { AxiosError } from "axios";
import axios from "@/services/asios";
import { useRouter } from "next/navigation";
import { storeType } from "@/lib/store";
// import { storeType } from "@/lib/store";

const ELearningAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const loadingstate=useSelector((state:storeType)=>state.User.loading)
  useEffect(() => {
    (async function checkAuth() {
      dispatch(loading())

      const isAuthenticated = await checkUserAuthentication(dispatch);
      console.log(isAuthenticated);
      dispatch(loading())

      if (isAuthenticated) {
        router.replace("/");
      } else {
        localStorage.removeItem('access')
     
        
        return;
      }
    })();
  }, [dispatch, router]);
  // const states=useSelector((state:storeType)=>state.User)
  const { data: session } = useSession();
  useEffect(() => {
    const gloinfunction = async () => {
      console.log("login areat");

      if (session && session.accessToken) {
        localStorage.setItem("access", session?.accessToken);
        try {
          console.log(localStorage.getItem("access"));
          dispatch(loading())
          const data = await axios.post("/glogin");
          dispatch(loading())

          console.log(data);
          toast.success(data.message);
          dispatch(setUser(data.user));
          localStorage.setItem("access", data.accessTocken);
          signOut();
        } catch (error) {
          // toast.error(error.message);
          console.log(error);
          
        }
      }
    };
    gloinfunction();
  }, [session]);

  const [showPassword, setShowPassword] = useState(false);
  const [islogin, Setlogin] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      (!islogin && !formData.confirmPassword) ||
      (!islogin && !formData.name)
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!islogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      dispatch(loading())

      const response: AuthResponse = await api.post(
        islogin ? "/login" : "/signup",
        !islogin
          ? formData
          : { email: formData.email, password: formData.password }
      );
      dispatch(loading())
      localStorage.setItem('access',response.accsess)

      console.log(response);
      if (response.success && response && islogin) {
        dispatch(setUser(response.user));
      } else if (!islogin && response.data) {
        console.log('signin');
        
        router.push(`/auth/otp/${response.data.userid}`);
      }
      toast.success(response.message);
      console.log("users", response);

      return;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data.message);
        toast.error(
          error.response?.data.message || "An unexpected error occurred"
        );
        return;
      } else {
        toast.error("An unexpected error occurred");
        return;
      }
    }
  };

 
  return (
    <div className="min-h-screen bg-login-gradient flex items-center justify-center p-6">
    {loadingstate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-white" size={50} />
            <p className="text-white mt-2">Loading...</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          {/* Left side with branding */}
          <div className="flex flex-col justify-center text-white p-6">
            <h1 className="text-4xl font-bold mb-6">Welcome to EX Learning</h1>
            <p className="text-lg text-white/80 mb-8">
              Join our community of learners and start your educational journey
              today.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Personalized Learning</h3>
                  <p className="text-sm text-white/60">
                    Adaptive courses tailored to your needs
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Expert Instructors</h3>
                  <p className="text-sm text-white/60">
                    Learn from industry professionals
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side with form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {islogin ? "Login" : "Create Account"}
              </h2>
              <p className="text-white/60">
                {islogin
                  ? "Welcome again"
                  : "Start your learning journey today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!islogin && (
                <div>
                  <label
                    className="block mb-2 tinterface CustomAxiosError extends  {
  data: {
    message: string;
  };
}ext-sm font-medium">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    className="pl-10 pr-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white">
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {!islogin && (
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="pl-10 pr-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white">
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6">
               {islogin?'Login':' Create Account'}
              </Button>
              <p className="text-gray-300 cursor-pointer" onClick={()=>router.push('/auth/forgetpassword')}>Forgot password</p>
            </form>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={async () => {
                  const data = await signIn("google");

                  console.log(data, "in auuth pages....");
                }}
                className="bg-white/10 border-white/10 hover:bg-white/20">
                <Globe className="w-5 h-5" />
              </Button>
              {/* <Button
                  variant="outline"
                  className="bg-white/10 border-white/10 hover:bg-white/20">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/10 hover:bg-white/20">
                  <Facebook className="w-5 h-5" />
                </Button> */}
            </div>

            <p className="text-center mt-8 text-white/60">
              {islogin ? `Don't have account ? ` : "Already have an account ? "}
              <a
                onClick={() => {
                  formData.confirmPassword = "";
                  formData.name = "";
                  Setlogin((prev) => !prev);
                }}
                className="text-purple-400 cursor-pointer hover:text-purple-300 font-medium">
                {islogin ? "Sign up" : "Sign in"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ELearningAuth;

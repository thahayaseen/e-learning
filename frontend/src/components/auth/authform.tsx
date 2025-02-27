"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Globe } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { storeType } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import {
  loginUser,
  registerUser,
  googleLogin,
} from "@/lib/features/authService";

interface ELearningAuthProps {
  places?: string;
}
const InputField = ({ 
  type, 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  showPasswordToggle = false,
  isPasswordVisible = false,
  onToggleVisibility = () => {}
}: {
  type: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onToggleVisibility?: () => void;
}) => {
  const inputId = `input-${name}`;
  
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type={showPasswordToggle && isPasswordVisible ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 bg-white/5 border ${
            error ? "border-red-500" : "border-white/10"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
            onClick={onToggleVisibility}
          >
            {isPasswordVisible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
const ELearningAuth: React.FC<ELearningAuthProps> = ({ places }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [choosePath, setChoosePath] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const Rstate = useSelector((state: storeType) => state.User);
  const { data: session } = useSession();
  const routeing = places ? "/" + places : "/";

  // Toggle functions
  const toggleLogin = () => setIsLogin(!isLogin);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Handle input changes - FIXED to prevent losing focus
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev, 
        [name]: ""
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
      valid = false;
    } else {
      newErrors.email = "";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    } else {
      newErrors.password = "";
    }

    // Additional validations for registration
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Name is required";
        valid = false;
      } else {
        newErrors.name = "";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        valid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        valid = false;
      } else {
        newErrors.confirmPassword = "";
      }
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const result = await loginUser(
          { email: formData.email, password: formData.password }, 
          dispatch
        );
        if (result.success) {
          router.push(routeing);
        }
      } else {
        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password
        };
        const result = await registerUser(registerData, dispatch);
        
        if (result.success) {
          router.push("/auth/otp");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google login effect
  useEffect(() => {
    if (session && session?.accsessToken) {
      const handleGoogleLogin = async () => {
        const result = await googleLogin(session.accsessToken, dispatch);
        if (result.success) {
          await signOut({ redirect: false });
          router.push(routeing);
        }
      };
      handleGoogleLogin();
    }
  }, [session, router, dispatch, routeing]);

  // Custom input component with error message - FIXED to maintain focus
  

  return (
    <div className="min-h-screen bg-login-gradient flex items-center justify-center p-6">
      {/* Loading Overlay */}
      {Rstate.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-white" size={50} />
            <p className="text-white mt-2">Loading...</p>
          </div>
        </div>
      )}

      {/* Role Selection Modal */}
      {choosePath && (
        <div className="min-h-screen w-screen fixed z-50 backdrop-blur-sm flex items-center border-0 justify-center p-4">
          <Card className="w-full max-w-md bg-slate-900 shadow-xl">
            <CardContent className="p-6 ">
              <h1 className="text-2xl font-bold text-white text-center mb-8">
                Choose Your Role
              </h1>

              <div className="space-y-4">
                <Button
                  className="w-full h-14 text-lg bg-blue-800 hover:bg-blue-900 text-white"
                  onClick={() => {
                    router.push("/mentor");
                    setChoosePath(false);
                  }}>
                  Mentor
                </Button>

                <Button
                  className="w-full h-14 text-lg bg-blue-800 hover:bg-blue-900 text-white"
                  onClick={() => router.push("/")}>
                  Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
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
                {isLogin ? "Login" : "Create Account"}
              </h2>
              <p className="text-white/60">
                {isLogin
                  ? "Welcome again"
                  : "Start your learning journey today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Conditional rendering of form fields */}
              {!isLogin && (
                <InputField
                  type="text"
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
              )}

              <InputField
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <InputField
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                showPasswordToggle={true}
                isPasswordVisible={showPassword}
                onToggleVisibility={togglePasswordVisibility}
              />

              {!isLogin && (
                <InputField
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  showPasswordToggle={true}
                  isPasswordVisible={showConfirmPassword}
                  onToggleVisibility={toggleConfirmPasswordVisibility}
                />
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6">
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Create Account"
                )}
              </Button>

              {isLogin && (
                <p
                  className="text-gray-300 cursor-pointer"
                  onClick={() => router.push("/auth/forgetpassword")}>
                  Forgot password
                </p>
              )}
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
                onClick={() => signIn("google")}
                className="bg-white/10 border-white/10 hover:bg-white/20">
                <Globe className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-center mt-8 text-white/60">
              {isLogin ? `Don't have account ? ` : "Already have an account ? "}
              <a
                onClick={toggleLogin}
                className="text-purple-400 cursor-pointer hover:text-purple-300 font-medium">
                {isLogin ? "Sign up" : "Sign in"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ELearningAuth;
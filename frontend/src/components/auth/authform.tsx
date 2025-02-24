"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";

import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { loading } from "@/lib/features/User";

import { Loader2, Globe } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

import { useRouter } from "next/navigation";
import { storeType } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";

// Import components and services from our separate files
import { 
  EmailField, 
  PasswordField, 
  ConfirmPasswordField, 
  NameField 
} from "./FormComponents";
import { 
  loginSchema, 
  registerSchema, 
  loginInitialValues, 
  registerInitialValues 
} from "./validationSchemas";
import { loginUser, registerUser, googleLogin } from "@/lib/features/authService";

interface ELearningAuthProps {
  places?: string;
}

const ELearningAuth: React.FC<ELearningAuthProps> = ({ places }) => {
  const [islogin, setLogin] = useState(true);
  const [choosepath, setCpath] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();
  const Rstate = useSelector((state: storeType) => state.User);

  const { data: session } = useSession();
  const routeing = places ? '/' + places : '/';
  
  // Handle form submission
  const handleFormSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    if (islogin) {
      const result = await loginUser(values, dispatch);
      if (result.success) {
        router.push(routeing);
      }
    } else {
      const { confirmPassword, ...registerData } = values;
      const result = await registerUser(registerData, dispatch);
      if (result.success) {
        setLogin(true);
        resetForm();
        setCpath(true);
      }
    }
    setSubmitting(false);
  };

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
      {choosepath && (
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
                    setCpath(false);
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
                {islogin ? "Login" : "Create Account"}
              </h2>
              <p className="text-white/60">
                {islogin
                  ? "Welcome again"
                  : "Start your learning journey today"}
              </p>
            </div>

            <Formik
              initialValues={islogin ? loginInitialValues : registerInitialValues}
              validationSchema={islogin ? loginSchema : registerSchema}
              onSubmit={handleFormSubmit}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Conditional rendering of form fields */}
                  {!islogin && <NameField errors={errors} touched={touched} />}
                  
                  <EmailField errors={errors} touched={touched} />
                  
                  <PasswordField 
                    errors={errors} 
                    touched={touched} 
                    showPassword={showPassword}
                    togglePassword={togglePasswordVisibility}
                  />

                  {!islogin && (
                    <ConfirmPasswordField 
                      errors={errors} 
                      touched={touched} 
                      showPassword={showConfirmPassword}
                      togglePassword={toggleConfirmPasswordVisibility}
                    />
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6">
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : islogin ? (
                      "Login"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  {islogin && (
                    <p
                      className="text-gray-300 cursor-pointer"
                      onClick={() => router.push("/auth/forgetpassword")}>
                      Forgot password
                    </p>
                  )}
                </Form>
              )}
            </Formik>
            
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
              {islogin ? `Don't have account ? ` : "Already have an account ? "}
              <a
                onClick={() => setLogin(!islogin)}
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
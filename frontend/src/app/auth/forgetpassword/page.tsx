"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { get_cookie, save_cookie } from "@/lib/features/cookie";
import axios from "@/services/asios";
import { useRouter } from "next/navigation";
const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email);
  const data=  await axios.post("/forgotpass", {
      email: email,
    });
    console.log(data.token.token);
    save_cookie('reset_Token',data.token.token)
    console.log(JSON.stringify(get_cookie('reset_Token')));
    
    router.push("/auth/forgetpassword/otp/");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="space-y-2">
          <div className="w-full flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-600/10">
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-slate-400 text-center">
            Enter your email address and we'll send you instructions to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              Send Reset Instructions
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-blue-400 hover:text-blue-300">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

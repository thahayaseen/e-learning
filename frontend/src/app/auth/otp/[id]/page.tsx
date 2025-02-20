"use client";
import React, { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useParams,useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Timer } from "lucide-react";
import toast from "react-hot-toast";

import axios from "@/services/asios";

function Page() {
  const router=useRouter()
  const ParamRouter=useParams()

 

  const handleChanges = (e) => {
    console.log("here");

    if (/^\d*$/.test(e)) {
      setValue(e);
    } else {
      toast.error("Please Enter number");
    }
  };
  const handleResend = async () => {
    try {
     
      const data = await axios.post("/resent", {
        userid: ParamRouter.id,
      });
      console.log(data);
      toast.success(data.message)
    } catch (error) {
      console.log(error);
      
      toast.error(error.response.data.message);
    }
  };
  
  const [rOtpbtn, setRopt] = useState(false);
  const [timer, setTimer] = useState(10);
  const [value, setValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const intervel = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervel);
    } else {
      console.log("done");
      setRopt(true);
    }
  }, [timer]);
  const handleSubmit = async () => {
    if (value.length !== 6) return;
    setIsVerifying(true);
    console.log(value);
    console.log(ParamRouter.id);
    
    try {
      const response = await axios.post("/verify", {
        userid: ParamRouter.id,
        otp: value,
      });
      console.log(response);
      if(response.success){
      toast.success('Sucessfully varifyed')
      router.push('/auth')
      }
      setIsVerifying(false);
    } catch (error) {
      console.log(error.response.data.message);
      toast.error(error.response.data.message);
      setIsVerifying(false);
    }
  };
  console.log(timer);
  // if(!ParamRouter.id||ParamRouter.id.length<17){
  //   router.push('/auth')
  // }
  return (
    <div className="min-h-screen bg-login-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-bold text-center text-white/90">
            Verification Required
          </CardTitle>
          <CardDescription className="text-center text-white/70">
            Enter the 6-digit code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={value}
              onChange={(e) => {
                handleChanges(e);
              }}
              maxLength={6}
              className="gap-2">
              {" "}
              {/* Set a horizontal gap between slots */}
              {[0, 1, 2].map((index) => (
                <InputOTPGroup className="flex gap-4" key={index}>
                  <InputOTPSlot
                    key={index}
                    index={index}
                    inputMode="numeric"
                    className="w-12 h-12 rounded-lg bg-white/5 border-white/20  text-white transition-all duration-200
                  focus:bg-white/10 focus:border-blue-400/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)]
                  animate-slide-up [animation-delay:var(--delay)]"
                  />
                </InputOTPGroup>
              ))}
              <InputOTPSeparator className="text-white/50">-</InputOTPSeparator>
              {[3, 4, 5].map((index) => (
                <InputOTPGroup className="flex gap-4" key={index}>
                  <InputOTPSlot
                    key={index}
                    index={index}
                    inputMode="numeric"
                    className="w-12 h-12 rounded-lg bg-white/5 text-white text-lg border-white/20 transition-all duration-200
                  focus:bg-white/10 focus:border-blue-400/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.5)]
                  animate-slide-up [animation-delay:var(--delay)]"
                  />
                </InputOTPGroup>
              ))}
            </InputOTP>
          </div>
          <Button
            onClick={handleResend}
            disabled={!rOtpbtn}
            variant={rOtpbtn ? "default" : "secondary"}
            className="flex items-center gap-2 transition-all bg-transparent duration-200 hover:scale-105">
            <Timer className="w-4 h-4" />
            {rOtpbtn ? (
              "Resend OTP"
            ) : (
              <span className="flex items-center text-white gap-2">
                Wait {timer}s to resend
              </span>
            )}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={value.length !== 6 || isVerifying}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-5 text-sm font-medium
                     backdrop-blur-sm transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <Timer className="animate-spin" size={16} />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check size={16} />
                Verify Code
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;

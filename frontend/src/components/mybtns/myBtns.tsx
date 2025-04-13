"use client";
// import { signOut } from "next-auth/react";
import React from "react";
import { clearGs } from "@/lib/auth";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/features/User";
import { useRouter } from "next/navigation";
import { delete_cookie } from "@/lib/features/cookie";
import { Button } from "../ui/button";
import { PlayCircle } from "lucide-react";
export function Sighnout({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  const dispatch = useDispatch();
  console.log(isLoggedIn);
  if (isLoggedIn) {
    return (
      <Button
        className="text-gray-300 bg-blue-900 hover:to-blue-950 transition-all"
        onClick={() => {
          console.log("happended");
          delete_cookie("access");
          clearGs(dispatch);
          router.push("/auth");
        }}>
        signOut
      </Button>
    );
  } else {
    return (
      <div className="hidden md:flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            router.push("/auth");
          }}
          className="text-gray-300 hover:to-blue-950 transition-all">
          Log in
        </Button>
        <Button
          className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white"
          onClick={() => {
            router.push("/auth");
          }}>
          Sign up
        </Button>
      </div>
    );
  }
}

export function Profile() {
  const router = useRouter();

  return (
    <a
      onClick={() => {
        router.push("/profile");
      }}
      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
      Your Profile
    </a>
  );
}

export function Explore({ _id }: { _id: string }) {
  const router = useRouter();
  console.log(_id);

  return (
    <Button
      variant="ghost"
      className="hover:bg-indigo-800/50 text-white hover:text-white"
      onClick={() => router.push("/course/" + _id)}>
      Explore
    </Button>
  );
}

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";

export function Continue({
  id,
  className = "",
  variant = "default",
  size = "sm",
}: {
  id: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const router = useRouter();

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      router.push(`/course/view/${id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      // Optional: Add error handling toast or notification
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`flex items-center gap-2 ${className}`}
            onClick={handleContinue}
            aria-label="Continue Course">
            <PlayCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Continue</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="z-auto">
          Continue learning this course
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const User = () => {};
export const LogoutBtn = () => {
  const dispatch = useDispatch();
  return (
    <Button
      onClick={async () => {
        await clearGs(dispatch);
      }}>
      Logout
    </Button>
  );
};

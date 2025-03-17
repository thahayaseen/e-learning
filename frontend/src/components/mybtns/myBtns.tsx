"use client";
// import { signOut } from "next-auth/react";
import React from "react";
import { clearGs } from "@/lib/auth";
import { useDispatch } from "react-redux";
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
      className="hover:bg-indigo-800/50 hover:text-white"
      onClick={() => router.push("/course/" + _id)}>
      Explore
    </Button>
  );
}

export function Continue({ id }: { id: string }) {
  const router = useRouter();

  return (
    <div className="flex"
      onClick={() => {
        console.log("in datass");

        router.push("/course/view/" + id);
      }}>
      <PlayCircle className="h-4 w-4" />
      Continue
    </div>
  );
}

export const User = () => {};

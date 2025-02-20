"use client";
// import { signOut } from "next-auth/react";
import React from "react";
import { clearGs } from '@/lib/auth'
import {useDispatch} from 'react-redux'
// import { useRouter } from "next/navigation";

export function Sighnout() {
  // const router=useRouter()
  const dispatch=useDispatch()
  return (
    <div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        onClick={() => {
            console.log('happended');
            localStorage.removeItem('access')
            clearGs(dispatch)

            }}>
        Sign Up
      </button>
    </div>
  );
}



"use client";
// import { signOut } from "next-auth/react";
import React from "react";
import { clearGs } from '@/lib/auth'
import {useDispatch} from 'react-redux'
import { useRouter } from "next/navigation";
import { delete_cookie, get_cookie } from "@/lib/features/cookie";

export function Sighnout() {
  const router=useRouter()
  const tocken=get_cookie('access')
  console.log(tocken);
  
  const dispatch=useDispatch()
  return (
    
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        onClick={() => {
            console.log('happended');
            delete_cookie('access')
            clearGs(dispatch)
            router.push('/auth')
            }}>
        {tocken?'Sign-Out':'Sign-in'}
      </button>
    
  );
}

export const User=()=>{

}

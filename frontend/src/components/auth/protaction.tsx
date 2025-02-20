"use client"
import React,{useEffect} from 'react'
import { useSelector } from 'react-redux'
import { storeType } from '@/lib/store'
import { useRouter } from 'next/navigation'

function Protaction({children}:{children:React.ReactNode}) {
    const router=useRouter()
    const auth=useSelector((state:storeType)=>state.User.isAuthenticated)
    useEffect(()=>{
        if(!auth){
            router.push('/login')
        }
    },[router,auth])
  return auth?{children}:null

}

export default Protaction

"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, usePathname } from "next/navigation"
import type { AppDispatch, storeType } from "@/lib/store"
import { Varify } from "@/lib/features/User"
import Roles from "@/lib/roleEnum"
import { Loader2 } from "lucide-react"

function Protection({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const path = usePathname()

  const { user, isAuthenticated, loading } = useSelector((state: storeType) => state.User)

  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if the current path is a public route that doesn't need authentication
  const isPublicRoute = path === "/" || path === "/auth"
  
  // Initialize verification state
  useEffect(() => {
    const verifyUser = async () => {
      if (isPublicRoute) {
        console.log('Public route detected - skipping verification');
        setIsVerifying(false)
        return
      }
      
      try {
        console.log('Protected route - verifying user');
        await dispatch(Varify()).unwrap()
      } catch (error) {
        console.log("Verification failed:", error)
      } finally {
        setIsVerifying(false)
      }
    }
    
    verifyUser()
  }, [dispatch, isPublicRoute, path])

  // Handle redirects after verification
  useEffect(() => {
    // Skip all checks for public routes
    if (isPublicRoute) {
      return
    }

    // Wait until verification is complete
    if (isVerifying) {
      return
    }

    // If not authenticated, redirect to auth
    if (!isAuthenticated) {
      console.log('Not authenticated - redirecting to auth');
      router.push("/auth")
      return
    }

    // Role-based access control
    if (user?.role) {
      const isAdminPath = path.startsWith("/admin")
      const isMentorPath = path.startsWith("/mentor")

      if (isAdminPath && user.role !== Roles.ADMIN) {
        console.log('Not admin - redirecting from admin path');
        router.replace("/")
      } else if (isMentorPath && user.role !== Roles.MENTOR) {
        console.log('Not mentor - redirecting from mentor path');
        router.replace("/")
      }
    }
  }, [isAuthenticated, user?.role, path, router, isVerifying, isPublicRoute])

  // Prevent flashing by always showing loading state during initial load
  // or when authentication state is changing, except for public routes
  if ((isVerifying || loading) && !isPublicRoute) {
    console.log('Showing loading state');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-xl text-white">Verifying access...</p>
        </div>
      </div>
    )
  }

  // For public routes, always render children
  if (isPublicRoute) {
    console.log('Rendering public route content');
    return <>{children}</>
  }

  // Only render protected content when we're fully verified and authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated - not rendering protected content');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-xl text-white">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (path.startsWith("/admin") && user?.role !== Roles.ADMIN) {
    console.log('Not admin - not rendering admin content');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-xl text-white">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (path.startsWith("/mentor") && user?.role !== Roles.MENTOR) {
    console.log('Not mentor - not rendering mentor content');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-xl text-white">Redirecting...</p>
        </div>
      </div>
    )
  }

  // All checks passed, render the children
  console.log('All checks passed - rendering protected content');
  return <>{children}</>
}

export default Protection
"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
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

  // Get user state from Redux
  const { user, isAuthenticated,loading } = useSelector((state: storeType) => state.User)

  // Local verification state - separate from the global loading state
  const [isVerifying, setIsVerifying] = useState(true)

  // Use a ref to track if verification has been attempted
  const verificationAttempted = useRef(false)

  // Check if the current path is a public route that doesn't need authentication
  const isPublicRoute = path === "/" || path === "/auth"||path.startsWith('/auth')

  // Initialize verification state - only run once per path change
  useEffect(() => {
    const verifyUser = async () => {
      // Skip verification for public routes
      if (isPublicRoute) {
        console.log("Public route detected - skipping verification")
        setIsVerifying(false)
        return
      }

      // Skip if we've already verified for this path
      if (verificationAttempted.current) {
        return
      }

      verificationAttempted.current = true
      setIsVerifying(true)

      try {
        console.log("Protected route - verifying user")
        await dispatch(Varify()).unwrap()
      } catch (error) {
        console.log("Verification failed:", error)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyUser()

    // Reset verification flag when path changes
    return () => {
      verificationAttempted.current = false
    }
  }, [dispatch, isPublicRoute])

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
      console.log("Not authenticated - redirecting to auth")
      router.push("/auth")
      return
    }

    // Role-based access control
    if (user?.role) {
      const isAdminPath = path.startsWith("/admin")
      const isMentorPath = path.startsWith("/mentor")

      if (isAdminPath && user.role !== Roles.ADMIN) {
        console.log("Not admin - redirecting from admin path")
        router.replace("/")
      } else if (isMentorPath && user.role !== Roles.MENTOR) {
        console.log("Not mentor - redirecting from mentor path")
        router.replace("/")
      }
    }
  }, [isAuthenticated, user?.role, path, router, isVerifying, isPublicRoute])


  // Render loading state
  if ((isVerifying && !isPublicRoute)) {
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
    return <>{children}</>
  }

  // Only render protected content when we're fully verified and authenticated
  if (!isAuthenticated) {
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
  return <>{children}</>
}

export default Protection


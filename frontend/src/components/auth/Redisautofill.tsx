"use client";
import { useEffect, useState } from "react";
import type React from "react";

import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import type { AppDispatch, storeType } from "@/lib/store";
import { Varify } from "@/lib/features/User";
import Roles from "@/lib/roleEnum";
import { Loader2, ShieldAlert } from "lucide-react";

// Local storage key for intended path
const INTENDED_PATH_KEY = "intendedPath";

function Protection({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const path = usePathname();
  const { user, isAuthenticated } = useSelector(
    (state: storeType) => state.User
  );

  // Client-side rendering protection
  const [mounted, setMounted] = useState(false);
  // Single loading state for better control
  const [pageState, setPageState] = useState({
    isLoading: true,
    isAccessDenied: false,
  });

  const authRoutes = ["/auth"];
  const unrestrictedRoutes = ["/", "/course"];
  // Add /payment to common paths so all authenticated users can access it
  const commonPaths = [
    "/settings",
    "/profile",
    "/payment",
    "/paymentsuccess",
    "/meet",
  ];

  // Role-specific routes
  const adminRoutes = ["/admin"];
  const mentorRoutes = ["/mentor"];
  // Update the studentRoutes array to explicitly include the course and payment success routes
  const studentRoutes = ["/course", "/", "/paymentsuccess"];

  // Update the isAuthRoute check to be more consistent
  const isAuthRoute = path === "/auth" || path.startsWith("/auth/");

  // Helper function to check if a path is unrestricted
  const isUnrestrictedRoute = (path: string) => {
    return unrestrictedRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );
  };

  // Helper function to check if path is common path
  const isCommonPath = (path: string) => {
    return commonPaths.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );
  };

  // Get home path based on user role
  const getHomePath = (role?: string) => {
    switch (role) {
      case Roles.ADMIN:
        return "/admin";
      case Roles.MENTOR:
        return "/mentor";
      case Roles.STUDENT:
        return "/";
      default:
        return "/";
    }
  };

  // Update the hasPathPermission function to improve route checking
  const hasPathPermission = (role: string, path: string) => {
    // Common paths accessible by all authenticated users
    if (isCommonPath(path)) {
      return true;
    }

    // Unrestricted routes accessible by all
    if (isUnrestrictedRoute(path)) {
      return true;
    }

    // Strict role-based access control
    switch (role) {
      case Roles.ADMIN:
        // Admin can access admin routes, mentor routes, student routes and common paths
        return (
          adminRoutes.some(
            (route) => path === route || path.startsWith(`${route}/`)
          ) ||
          mentorRoutes.some(
            (route) => path === route || path.startsWith(`${route}/`)
          ) ||
          studentRoutes.some((route) => {
            console.log(route, "route is ", path.startsWith(`${route}/`));

            return (
              path === route ||
              path.startsWith(`${route}/`) ||
              (route === "/course" && path.startsWith("/course"))
            );
          })
        );

      case Roles.MENTOR:
        // Mentor can access mentor routes, student routes and common paths
        return mentorRoutes.some((route) => {
          console.log(
            route,
            "routeis",
            path === route,
            path.startsWith(`${route}/`)
          );

          return path === route || path.startsWith(`${route}/`);
        });

      case Roles.STUDENT:
        // Students can access student routes, dashboard, courses and common paths
        console.log("from herere ", path, router);
        const dat = studentRoutes.some((route) => {
          console.log(route, "route is ", path, path.startsWith(`${route}`));

          return path.startsWith("/admin")
            ? false
            : path.startsWith("/mentor")
            ? false
            : true ||
              path === route ||
              path.startsWith(`${route}`) ||
              (route === "/course" && path.startsWith("/course"));
        });
        console.log(dat);

        return dat;

      default:
        return false;
    }
  };

  // Fix hydration error by ensuring component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Main authentication and authorization check
  useEffect(() => {
    // Skip auth check if not mounted yet
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        // Always start with loading state
        setPageState({ isLoading: true, isAccessDenied: false });

        // Verify user authentication - wait for this to complete before making decisions
        const result: any = await dispatch(Varify()).unwrap();

        // User is authenticated
        if (result?.success && user?.role) {
          // Handle auth routes (login/register) - prevent authenticated users from accessing
          if (isAuthRoute) {
            // User is already logged in, redirect to their home page
            const homePath = getHomePath(user.role);
            router.replace(homePath);
            return;
          }

          // Handle unrestricted routes - always allow access
          if (isUnrestrictedRoute(path)) {
            setPageState({ isLoading: false, isAccessDenied: false });
            return;
          }

          // Check permissions for the current path
          if (hasPathPermission(user.role, path)) {
            console.log(
              "from hererererererer",
              hasPathPermission(user.role, path)
            );

            setPageState({ isLoading: false, isAccessDenied: false });
          } else {
            // User does not have permission
            setPageState({ isLoading: false, isAccessDenied: true });

            // Redirect to role-specific home after briefly showing access denied
            setTimeout(() => {
              router.replace(getHomePath(user.role));
            }, 1500);
          }
        }
        // User is not authenticated
        else {
          // Allow access to auth and unrestricted routes
          if (isAuthRoute || isUnrestrictedRoute(path)) {
            setPageState({ isLoading: false, isAccessDenied: false });
          } else {
            // Save current path for redirection after login
            localStorage.setItem(INTENDED_PATH_KEY, path);
            // Redirect to login for protected routes
            // router.replace("/auth")
          }
        }
      } catch (error) {
        console.log("Auth error:", error);

        // Even on error, show unrestricted routes
        if (isAuthRoute || isUnrestrictedRoute(path)) {
          setPageState({ isLoading: false, isAccessDenied: false });
        } else {
          // On protected route with error, redirect to login
          localStorage.setItem(INTENDED_PATH_KEY, path);
          router.replace("/auth");
        }
      }
    };

    checkAuth();
  }, [dispatch, path, user?.role, mounted, router, isAuthRoute]);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Loading state
  if (pageState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-xl text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (pageState.isAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <ShieldAlert className="h-16 w-16 text-red-500" />
          <p className="text-xl text-white">Access Denied</p>
          <p className="text-base text-gray-400">
            You don't have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  // Only render children when all checks pass
  return <>{children}</>;
}

export default Protection;

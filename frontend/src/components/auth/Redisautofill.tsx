"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import stores, { AppDispatch, storeType } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { Varify } from "@/lib/features/User";
import Roles from "@/lib/roleEnum";

function Protection({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const auth = useSelector((state: storeType) => state.User);
  const path = usePathname();
  localStorage.setItem("item", path);
  useEffect(() => {
    (async function verifyUser() {
      if (auth.loading) return; // Prevent running while loading
      if (!auth.isAuthenticated) {
        // const paths = localStorage.getItem("path");
        try {
          await dispatch(Varify()).then(() => {
            const updatedAuth = stores.getState().User;
            // console.log(paths);

            if (updatedAuth.user?.role === Roles.ADMIN) {
              
              router.push("/admin");
            } else if (updatedAuth.user?.role === Roles.MENTOR) {
              router.push("/mentor");
            } else {
              router.push("/");
            }
          });
        } catch (error) {
          console.error("Verification failed:", error);
          router.push("/login");
        }
      } else {
        if (auth.isAuthenticated && auth.user?.role === Roles.STUDENT) {
          router.push("/");
        } else if (auth.isAuthenticated && auth.user?.role === Roles.ADMIN) {
          router.push("/admin");
        }
      }
    })();
  }, [router, auth.isAuthenticated, auth.user?.role, auth.isLoading, dispatch]);

  return <>{children}</>;
}

export default Protection;

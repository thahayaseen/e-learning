"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";


import {
  SidebarGroupLabel,
  SidebarMenu,
  
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function TeamSwitcher() {
  const {  open, toggleSidebar } = useSidebar();


  return (
    <SidebarMenu onClick={toggleSidebar} className="cursor-pointer"> 
      {open && (
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="object-contain w-full"
          />
        )}
      {!open && (
        <div className="flex aspect-square size-9 items-center justify-center rounded-lg cursor-pointer  bg-blue-700 text-sidebar-primary-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect x="0" y="0" width="100" height="100" rx="20" fill="#1D4ED8" />

            <path
              d="M30 25 H50 C65 25, 75 35, 75 50 C75 65, 65 75, 50 75 H30 Z"
              fill="white"
            />
            <path
              d="M40 35 H50 C58 35, 65 40, 65 50 C65 60, 58 65, 50 65 H40 Z"
              fill="#1D4ED8"
            />
          </svg>
        </div>
      )}
      <SidebarGroupLabel className="align-middle justify-between text-red-50 font-bold bg-blue-700 text-lg py-5 px-5 items-center relative">
        <span>Mentor Dashboard</span>
        <button
          
          className="absolute right-2 p-1 rounded hover:bg-blue-600 transition-colors"
          aria-label={open ? "Expand sidebar" : "Collapse sidebar"}>
          {open ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </SidebarGroupLabel>
    </SidebarMenu>
  );
}

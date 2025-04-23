"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
  Video,
} from "lucide-react";

import { NavMain } from "../nav-main";
import { NavProjects } from "../nav-projects";
import { NavUser } from "../nav-user";
import { TeamSwitcher } from "../team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { LogoutBtn } from "../mybtns/myBtns";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashbord",
      url: "/mentor",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "User managment",
      url: "/mentor/usermanagment",
      icon: User,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "My course",
      url: "/mentor/courses",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Chats",
      url: "/mentor/chats",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
    {
      title: "Meets",
      url: "/mentor/meets",
      icon: Video,
    
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const path=router
  // const [active,setActive]=React.useState('/mentor')
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <LogoutBtn />
      </SidebarFooter>
    </Sidebar>
  );
}

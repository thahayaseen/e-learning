import AdminDashboard from "@/components/admin/AdminDash";
import Sidebar from "@/components/admin/sidebar";
import { Card } from "@/components/ui/card";
import React from "react";

// import AdminAuth from "@/services/adminAuth";
function Adminusers() {
  console.log("entered admin side");

  return <Sidebar path="Dashboard" Content={<AdminDashboard />} />;
}

export default Adminusers;

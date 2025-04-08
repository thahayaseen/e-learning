import Usersdash from "@/components/admin/users";
import Sidebar from "@/components/admin/sidebar";
import React from "react";

function Adminusers() {
  return <Sidebar Content={<Usersdash />} path={"User Management"} />;
}

export default Adminusers;

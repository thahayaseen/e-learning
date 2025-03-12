import AdminCourseManagement from "@/components/admin/aprover";
import Sidebar from "@/components/admin/sidebar";
import React from "react";

function page() {
  return (<Sidebar path="Course Management" Content={<AdminCourseManagement />}/>);
}

export default page;

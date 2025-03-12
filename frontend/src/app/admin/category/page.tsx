import AdminPanel from "@/components/admin/category";
import Sidebar from "@/components/admin/sidebar";
import React from "react";

function CategoryPage() {
  return <Sidebar Content={<AdminPanel />} path="Category" />;
}

export default CategoryPage;

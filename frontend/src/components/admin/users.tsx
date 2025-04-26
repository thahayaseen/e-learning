"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import PaginationComponent from "../default/pagination";
import { UserCheck, UserX, Search, Filter, RefreshCcw } from "lucide-react";
import AdminTable from "./adminuserTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axios from "@/services/asios";
import { Adminshousers } from "@/services/interface/userinterface";
import toast from "react-hot-toast";
import { fetchUsers } from "@/services/fetchdata";
import UserBlockbtn from "../mybtns/userBlockbtn";

const UserManagementPage = () => {
  const [users, setUsers] = useState<Adminshousers[]>([]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [limit, setLimit] = useState(2);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const urlparams = new URLSearchParams();
      urlparams.append("page", String(page));
      urlparams.append("limit", String(limit));
      if (roleFilter.trim() !== "") {
        urlparams.append("rolefilter", roleFilter);
      }
      if (statusFilter.trim() !== "") {
        urlparams.append("statusFilter", statusFilter);
      }
      if (debouncedSearchTerm.trim() !== "") {
        urlparams.append("search", debouncedSearchTerm);
      }

      const response = await fetchUsers(`/allusers?` + urlparams.toString());
       setTotal(response.totalpages);
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
 
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearchTerm, roleFilter]);

  useEffect(() => {
    fetchUser();
  }, [page, limit, statusFilter, debouncedSearchTerm, roleFilter, fetchUser]);

  const toggleBlock = async (id: string, type) => {
     try {
      const response: any = await axios.put("/blockuser", {
        userid: id,
        type: !type,
      });

      setUsers((prev) =>
        prev.map((user) => {
          return user._id == id
            ? { ...user, isBlocked: !user.isBlocked }
            : user;
        })
      );
       toast.success(response.message || "User status updated");
    } catch (error) {
       toast.error(error.message || "Failed to update user status");
 
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  const activeUsers = useMemo(
    () => users.filter((user) => !user.isBlocked).length,
    [users]
  );
  const blockedUsers = useMemo(
    () => users.filter((user) => user.isBlocked).length,
    [users]
  );
  const userColumns = [
    {
      key: "name",
      header: "Name",
      render: (user: Adminshousers) => (
        <>
          {user.name}
          {user.isBlocked && (
            <Badge className="ml-2 bg-red-900/30 text-red-300 border-red-500">
              Blocked
            </Badge>
          )}
        </>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user: Adminshousers) => user.email,
    },
    {
      key: "role",
      header: "Role",
      render: (user: Adminshousers) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.role === "Admin"
              ? "bg-blue-500 text-white"
              : user.role === "Editor"
              ? "bg-indigo-500 text-white"
              : "bg-blue-600 text-white"
          }`}>
          {user.role}
        </span>
      ),
    },
    {
      key: "lastActive",
      header: "Last Active",
      render: (user: Adminshousers) => user.lastActive,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => <UserBlockbtn toggleBlock={toggleBlock} user={item} />, // This will be handled by the component's built-in actions
    },
  ];
  return (
    <div className="min-h-screen w-full bg-blue-950">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">User Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-800 border-blue-700 shadow-lg hover:bg-blue-750 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-800 border-blue-700 shadow-lg hover:bg-blue-750 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{activeUsers}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-800 border-blue-700 shadow-lg hover:bg-blue-750 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Blocked Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{blockedUsers}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            {/* Search with debouncing */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-300" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8 bg-blue-800 border-blue-700 text-white placeholder:text-blue-300 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm !== debouncedSearchTerm && (
                <span className="absolute right-2 top-2.5 text-xs text-blue-300">
                  Searching...
                </span>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-300" />
                <span className="text-blue-300 text-sm">Filters:</span>
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-blue-800 border-blue-700 text-white w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-blue-800 border-blue-700 text-white w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="isBlocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-blue-400 text-blue-400 hover:bg-blue-800/50">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        <AdminTable
          columns={userColumns}
          data={users}
          isLoading={isLoading}
          toggleBlock={toggleBlock}
        />

        <div className="mt-4">
          <PaginationComponent
            page={page}
            setPage={setPage}
            total={total}
            itemsPerPage={limit}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
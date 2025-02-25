"use client";
import React, { useEffect, useState, useMemo } from "react";
import PaginationComponent from "../default/pagination";
import {
  UserCheck,
  UserX,
  Search,
  Filter,
  RefreshCcw
} from "lucide-react";
import AdminTable from "./adminTable";
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
import { Adminshousers } from "@/services/userinterface";
import toast from "react-hot-toast";

const UserManagementPage = () => {
  const [users, setUsers] = useState<Adminshousers[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Adminshousers[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/allusers?page=${page}&limit=${5}`);
      setTotal(response.data.totalpages);
      setUsers(response.data.formattedData);
      setFilteredUsers(response.data.formattedData);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const applyFilters = () => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "All") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter === "Active") {
      result = result.filter((user) => !user.blocked);
    } else if (statusFilter === "Blocked") {
      result = result.filter((user) => user.blocked);
    }

    setFilteredUsers(result);
  };

  const toggleBlock = async (userId, type) => {
    console.log(userId);
    try {
      
      const response = await axios.post('/blockuser', {
        userid: userId,
        type: !type
      });
      
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, blocked: !user.blocked } : user
        )
      );
      console.log(response);
      
      toast.success(response.message || "User status updated");
    } catch (error) {
      toast.error("Failed to update user status");
      console.error("Error updating user status:", error);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  const activeUsers = useMemo(() => users.filter(user => !user.blocked).length, [users]);
  const blockedUsers = useMemo(() => users.filter(user => user.blocked).length, [users]);
const [colomns,setColomns]=useState<string[]>(["Name","Email","Role","Created","Actions"])
  return (
    <div className="min-h-screen bg-blue-950">
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
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-300" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8 bg-blue-800 border-blue-700 text-white placeholder:text-blue-300 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-blue-800 border-blue-700 text-white w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
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

        <AdminTable colomns={colomns} filteredUsers={filteredUsers} isLoading={isLoading} toggleBlock={toggleBlock} />
        
        {filteredUsers.length > 0 && (
          <div className="mt-4">
            <PaginationComponent page={page} setPage={setPage} total={total} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
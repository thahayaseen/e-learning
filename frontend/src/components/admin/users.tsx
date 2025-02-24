"use client";
import React, { useEffect,  useState } from "react";
import PaginationComponent from "../default/pagination";
import {
  UserCheck,
  UserX,
 
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "@/services/asios";
import { Adminshousers } from "@/services/userinterface";
import toast from "react-hot-toast";

const UserManagementPage = () => {
  const [users, setUsers] = useState<Adminshousers[]>([]);
  const [page, setPage] = useState(1);
  const [total,settotal]=useState(1)
  // const [search,Setsearch]=useState('')
  useEffect(() => {
    // const data=axios.get('/api/products?page='+5)

    axios.get(`/allusers?page=${page}&limit=${5}`).then((data) => {
      console.log(data.data.totalpages, "fasdgfaghadfhsdf");
      settotal(data.data.totalpages)
      setUsers(data.data.formattedData)
      console.log(data.data.formattedData, "usedatass");
    });
  }, [page]);
  // console.log(searchParams);

  const toggleBlock = async(userId,type) => {
    console.log(type);
    
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, blocked: !user.blocked } : user
      )
    );
    const data=await axios.post('/blockuser',{
      userid:userId,
      type:!type
    })
    console.log(data);
    toast.success(data.message)
    
  };

  return (
    <div className=" min-h-screen bg-blue-950">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">User Overview</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader>
                <CardTitle className="text-white">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader>
                <CardTitle className="text-white">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {users.filter((user) => !user.blocked).length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader>
                <CardTitle className="text-white">Blocked Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {users.filter((user) => user.blocked).length}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-300" />
              <Input
                placeholder="Search users..."
                className="pl-8 bg-blue-800 border-blue-700 text-white placeholder:text-blue-300"
              />
            </div>
          </div>
        </div>

        <Card className="bg-blue-900 border-blue-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-800 hover:bg-blue-800">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">created</TableHead>
                  <TableHead className="text-white ">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter((data)=>{

                }).map((user:Adminshousers) => (
                  <TableRow
                    key={user.id}
                    className={`border-blue-800 ${
                      user.blocked ? "bg-blue-800/50" : "bg-blue-900"
                    } hover:bg-blue-800 transition-colors`}>
                    <TableCell className="font-medium text-white">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-blue-100">
                      {user.email}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-blue-100">
                      {user.lastActive}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={user.blocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => toggleBlock(user.id,user.blocked)}
                        className={`flex items-center gap-2 ${
                          user.blocked
                            ? "border-blue-400 text-blue-400 hover:bg-blue-800/50"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}>
                        {user.blocked ? (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4" />
                            Block
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <PaginationComponent page={page} setPage={setPage} total={total} />
    </div>
  );
};

export default UserManagementPage;

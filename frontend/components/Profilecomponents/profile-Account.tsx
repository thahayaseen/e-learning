import { TabsContent } from "../ui/tabs";
import { UserDTO } from "@/services/interface/CourseDto";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Mail,
  Shield,
  User,
  XCircle,
} from "lucide-react";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import Bementorfill from "./Bementorfill";
import { Imentorrequst } from "@/services/interface/mentorReqst";
import UserDetailsDialog from "../admin/moreMentorRequst";
import EditProfileDialog from "../editUser";
import ChangePassword from "./changePassword";

export function Account({
  userData,
  Beamentor,
  onSave,
}: {
  userData: UserDTO;
  Beamentor: Imentorrequst | null;
  onSave: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [changePassopen, setChangePassopen] = useState(false);
console.log(userData,'datatattae');

  return (
    <div
  
      className="space-y-6 bg-[#0a192f] min-h-screen p-6 rounded-xl">
      <EditProfileDialog
        isOpen={open}
        user={userData}
        onOpenChange={setOpen}
        onSave={onSave}
      />
      <ChangePassword open={changePassopen} setOpen={setChangePassopen} />
      <Card className="bg-[#112240] border-[#1a2b4a] rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-[#1a2b4a] bg-gradient-to-br from-[#0a192f] to-[#112240] p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#5CDB95] font-bold text-xl">
                Account Information
              </CardTitle>
              <CardDescription className="text-[#8892b0] mt-2">
                Your personal account details and settings
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setChangePassopen(true)}
                className="px-4 py-2 bg-[#1a2b4a] text-[#5CDB95] rounded-md 
                  hover:bg-[#5CDB95] hover:text-[#112240] 
                  transition-all duration-300 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Change Password
              </button>
              <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-[#5CDB95] text-[#112240] 
                  rounded-md hover:opacity-90 
                  transition-all duration-300 flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Information Cards */}
            <div
              className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a] 
                transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#8892b0]">
                  Full Name
                </h3>
                <User className="h-5 w-5 text-[#5CDB95]" />
              </div>
              <p className="text-lg font-bold text-white">{userData.name}</p>
            </div>

            <div
              className="bg-[#0a192f] p-5 rounded-xl border col-span-2 border-[#1a2b4a] 
                transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#8892b0]">
                  Email Address
                </h3>
                <Mail className="h-5 w-5 text-[#5CDB95]" />
              </div>
              <p className="text-lg font-bold text-white">{userData.email}</p>
            </div>

            <div
              className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a] 
                transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#8892b0]">
                  Account Role
                </h3>
                <Shield className="h-5 w-5 text-[#5CDB95]" />
              </div>
              <p className="text-lg font-bold text-white capitalize">
                {userData.role}
              </p>
            </div>

            {/* Verification Status */}
            <div
              className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a] 
                transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#8892b0]">
                  Verification Status
                </h3>
                {userData.verified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-lg font-bold text-white">
                {userData.verified ? "Verified" : "Not Verified"}
              </p>
            </div>

            {/* Mentor Section */}
            <div
              className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a] 
                transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                col-span-full md:col-span-2 lg:col-span-1 flex flex-col items-start justify-between">
              <h3 className="text-sm font-medium text-[#8892b0] mb-3">
                Be A Mentor
              </h3>
              {Beamentor ? (
                <UserDetailsDialog data={Beamentor} />
              ) : (
                <Bementorfill />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Security Section */}
      <Card className="bg-[#112240] border-[#1a2b4a] rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-[#0a192f] to-[#112240] p-6">
          <CardTitle className="text-[#5CDB95] font-bold text-xl">
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a]">
              <h3 className="text-sm font-medium text-[#8892b0] mb-3">
                Last Login
              </h3>
              <p className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#5CDB95]" />
                {new Date().toLocaleString()}
              </p>
            </div>
            <div className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a]">
              <h3 className="text-sm font-medium text-[#8892b0] mb-3">
                Account Created
              </h3>
              <p className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#5CDB95]" />
                {/* {JSON.stringify(userData)} */}
                {userData.CreatedAt
                  ? new Date(userData.CreatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

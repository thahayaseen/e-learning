"use client";
import React from "react";
import { Button } from "../ui/button";
import { Adminshousers } from "@/services/interface/userinterface";
import { UserCheck, UserX } from "lucide-react";

function UserBlockbtn({
  toggleBlock,
  user,
}: {
  toggleBlock: (userId: string, type: boolean) => void;
  user: Adminshousers;
}) {
  return (
    <Button
      variant={user.blocked ? "outline" : "destructive"}
      size="sm"
      onClick={() => toggleBlock(String(user.id), user.blocked)}
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
  );
}

export default UserBlockbtn;

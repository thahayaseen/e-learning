"use client";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

function GotoCoursebtn({id}:{id: string}) {
  const router = useRouter();
  return (
    <Button className="w-full py-6 text-base font-medium shadow-lg" onClick={() => router.push("/course/view/" + id)}>Watch</Button>
  );
}

export default GotoCoursebtn;

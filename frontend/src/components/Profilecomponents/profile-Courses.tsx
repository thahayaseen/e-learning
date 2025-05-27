"use client";

import { Card, CardContent } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { Clock, CheckCircle } from "lucide-react";

import { IProgressCollection } from "@/services/interface/CourseDto";
import Image from "next/image";
import { Continue } from "../mybtns/myBtns";
import PaginationComponent from "../default/pagination";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getImage } from "@/services/getImage";
export function Courses({
  courses,
  total,
  page,
  setPage,
  limit,
}: {
  courses: IProgressCollection[];
  total: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
}) {
  // const [pagec, setpageC] = useState(page);
   const nextPage = useCallback(() => {
    setPage((prev) => prev + 10);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
     setPage(page);
  }, [page, setPage]);

  // Early return if no courses
  if (!courses || courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a192f] p-6">
        <p className="text-gray-400">No courses available</p>
      </div>
    );
  }

  // Determine course status badge and color
  const getCourseStatus = (score: number) => {
    if (score === 100) return { text: "Completed", color: "bg-emerald-800" };
    if (score > 10) return { text: "In Progress", color: "bg-indigo-800" };
    return { text: "Not Started", color: "bg-gray-700" };
  };

  // Determine progress bar color
  const getProgressColor = (score: number) => {
    if (score === 100) return "bg-emerald-600";
    if (score > 50) return "bg-indigo-600";
    return "bg-purple-600";
  };

  return (
    <div
      value="courses"
      className="space-y-4 bg-[#0a192f] min-h-screen p-6 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3">
        {courses.map((course) => {
          const status = getCourseStatus(course.Score);
          const progressColor = getProgressColor(course.Score);

          return (
            <Card
              key={course._id}
              className="bg-[#112240] card border-[#1a2b4a] rounded-xl shadow-xl overflow-hidden 
                transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <div className="relative h-48 bg-[#1a2b4a]">
                {course?.image && (
                  <Image
                    width={400}
                    height={200}
                    src={`${getImage(course.image)}`}
                    alt={course.Title || "Course Image"}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] to-transparent" />

                <div className="absolute top-4 right-4">
                  {/* <Badge className={status.color}>{status.text}</Badge> */}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
                    {course?.Title || "Untitled Course"}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {course.Title || "No Additional Title"} •{" "}
                    {course.mentor?.name || "Unknown Mentor"}
                  </p>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Progress
                    value={course.progress.OverallScore}
                    className="h-2 flex-1 bg-gray-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${progressColor}`}
                      style={{ width: `${100}%` }}
                    />
                  </Progress>
                  <span className="text-sm font-medium text-white">
                    {course.progress.OverallScore}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    {course.Score === 100 ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        {course.UpdatedAt
                          ? new Date(course.UpdatedAt).toLocaleDateString()
                          : "Completed"}
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 text-indigo-400" />
                        {course.UpdatedAt
                          ? new Date(course.UpdatedAt).toLocaleDateString()
                          : "Started"}
                      </>
                    )}
                  </span>

                  <Continue id={course._id} className="z-50" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* <Button onClick={nextPage}>see More</Button> */}
    </div>
  );
}

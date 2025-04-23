"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Check, X, Eye, Loader2, FileX } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  actionCourse,
  getlessons,
  getunaprovedCourse,
} from "@/services/fetchdata";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { storeType } from "@/lib/store";
import { setloading } from "@/lib/features/User";
import AdminCourseLessonTaskView from "./course";
import { ICourses } from "@/services/interface/CourseDto";
import PaginationComponent from "../default/pagination";

const AdminCourseManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeOfList, setTypeOfList] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const { loading } = useSelector((state: storeType) => state.User);
  const dispatch = useDispatch();
  const [courses, setCourses] = useState<ICourses[]>([]);
  const [openCourse, setOpenCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ICourses | null>(null);

  // Memoized fetch function to reduce unnecessary re-renders
  const fetchCourses = useCallback(async () => {
    try {
      dispatch(setloading(true));
      const response = await getunaprovedCourse(page, typeOfList);
      setTotal(response.total);
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      // Optionally dispatch an error action or show a toast notification
    } finally {
      dispatch(setloading(false));
    }
  }, [page, typeOfList, dispatch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Memoized course action handler
  const handleCourseAction = useCallback(
    async (courseId: string, action: boolean) => {
      try {
        await actionCourse(courseId, action);
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === courseId
              ? {
                  ...course,
                  Approved_by_admin: action ? "approved" : "rejected",
                }
              : course
          )
        );
      } catch (error) {
        console.error("Failed to update course status:", error);
        // Optionally show error notification
      }
    },
    []
  );

  // Memoized course view handler
  const handleCourseView = useCallback(async (course: ICourses) => {
    try {
      const data = await getlessons(course._id);
      const courseWithLessons = { ...course, lessons: data.data };

      setSelectedCourse(courseWithLessons);
      setOpenCourse(true);
    } catch (error) {
      console.error("Failed to fetch course lessons:", error);
      // Optionally show error notification
    }
  }, []);

  // Filtered courses based on current tab
  const filteredCourses = useMemo(() => {
    if (typeOfList === "all") return courses;
    return courses.filter((course) => course.Approved_by_admin === typeOfList);
  }, [courses, typeOfList]);

  // Loading state component
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-white" size={50} />
          <p className="text-white mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {openCourse && (
        <AdminCourseLessonTaskView
          selectedcourse={selectedCourse}
          onClose={() => setOpenCourse(false)}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>
            Review and manage course submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={typeOfList}
            onValueChange={(value) => {
              const validTypes = ["all", "pending", "approved", "rejected"];
              if (validTypes.includes(value)) {
                setPage(1);
                setTypeOfList(value as typeof typeOfList);
              }
            }}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="pending">Pending Courses</TabsTrigger>
              <TabsTrigger value="approved">Approved Courses</TabsTrigger>
              <TabsTrigger value="rejected">Rejected Courses</TabsTrigger>
            </TabsList>

            <TabsContent value={typeOfList}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredCourses.length == 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                      <FileX className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No Courses Found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      There are currently no courses matching your criteria.
                 
                    </p>
                   
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <Card
                      key={course._id}
                      className={`
                      hover:shadow-lg transition-shadow
                      ${
                        course.Approved_by_admin === "approved"
                          ? "opacity-80"
                          : ""
                      }
                      ${
                        course.Approved_by_admin === "rejected"
                          ? "opacity-60"
                          : ""
                      }
                    `}>
                      <Image
                        priority
                        src={course.image || "/default.png"}
                        alt={course.Title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <CardHeader>
                        <CardTitle>{course.Title}</CardTitle>
                        <CardDescription>
                          By {course.Mentor_id?.name || "Thaha"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {course.Category.Category}
                          </Badge>
                          <span className="font-semibold">₹{course.Price}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div
                          className="border p-2 border-solid border-black rounded-sm cursor-pointer"
                          onClick={() => handleCourseView(course)}>
                          <Eye className="h-4 w-4" />
                        </div>
                        {course.Approved_by_admin === "approved" ||
                        course.Approved_by_admin === "rejected" ? (
                          <Badge
                            variant={
                              course.Approved_by_admin === "approved"
                                ? "default"
                                : "destructive"
                            }>
                            {course.Approved_by_admin}
                          </Badge>
                        ) : (
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleCourseAction(course._id, false)
                              }>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleCourseAction(course._id, true)
                              }>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <PaginationComponent
        page={page}
        setPage={setPage}
        total={total}
        itemsPerPage={5}
      />
    </div>
  );
};

export default AdminCourseManagement;

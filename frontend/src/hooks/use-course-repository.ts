"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { ICourses } from "@/services/interface/CourseDto";
import {
  getAllcourseUser,
  updateCourseApi,
  deleteCourseApi,
  getcourse,
  unlistCourse,
} from "@/services/fetchdata";

export function useCourseRepository() {
  const [courses, setCourses] = useState<ICourses[]>([]);
  const [latestCourses, setLatestCourses] = useState<ICourses[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [approvedCourses, setApprovedCourses] = useState(0);
  const [pendingCourses, setPendingCourses] = useState(0);

  // Fetch courses with pagination, filtering, and sorting
  const fetchCourses = useCallback(
    async (params: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      priceRange?: string;
      sortBy?: string;
    }) => {
      setIsLoading(true);
      try {
        console.log(params, "param is fas");

        const response = await getcourse(params);
        console.log(response, "cours ius ");

        setCourses(response.data);
        setLatestCourses(response.data.slice(0, 6));
        console.log(response, "response is ");

        setTotalCourses(response.total);

        // Calculate statistics
        const students = response.data.reduce(
          (sum, course) => sum + (course.Students_enrolled?.length || 0),
          0
        );
        setTotalStudents(students);

        const revenue = response.data.reduce(
          (sum, course) =>
            sum + (course.Price || 0) * (course.Students_enrolled?.length || 0),
          0
        );
        setTotalRevenue(revenue);

        setApprovedCourses(
          response.data.filter((c) => c.Approved_by_admin === "approved").length
        );
        setPendingCourses(
          response.data.filter((c) => c.Approved_by_admin === "pending").length
        );
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update a course
  const updateCourse = async (courseId: string, courseData: any) => {
    setIsLoading(true);
    try {
      let updated: any = {};
      for (let i in courseData) {
        const value = courseData[i];
        if (typeof value === "string") {
          if (value.trim() !== "") {
            updated[i] = value;
          }
        } else if (value !== null && value !== undefined) {
          updated[i] = value;
        }
      }
      const updatedCourse = await updateCourseApi(courseId, updated);
      console.log(updatedCourse, "upeeddd");
      // Update the courses list
      setCourses((prevCourses) => {
        const updatedList = prevCourses.map((course) => {
          if (course._id === courseId) {
            const newCourse = { ...course, ...updated };
            console.log("Updated course inside setCourses:", newCourse);
            return newCourse;
          }
          return course;
        });
        return updatedList;
      });
      setLatestCourses((prevCourses) => {
        const updatedList = prevCourses.map((course) => {
          if (course._id === courseId) {
            const newCourse = { ...course, ...updated };
            console.log("Updated course inside setCourses:", newCourse);
            return newCourse;
          }
          return course;
        });
        return updatedList;
      });

      console.log(
        courses.map((data) => {
          console.log(data._id, data._id == courseId);

          return data._id == courseId ? data : "";
        }),
        "data i updated ",
        courseId
      );

      return updatedCourse;
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(
        error instanceof Error ? error.message : "cannot update Course",
        {
          description: "Failed to save course data. Please try again.",
        }
      );
      // throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a course
  const ActionCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      await unlistCourse(courseId);

      // Remove the course from the list
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, unlist: !course.unlist }
            : course
        )
      );
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    setCourses,
    latestCourses,
    isLoading,
    totalCourses,
    totalStudents,
    totalRevenue,
    approvedCourses,
    pendingCourses,
    fetchCourses,
    updateCourse,
    ActionCourse,
  };
}

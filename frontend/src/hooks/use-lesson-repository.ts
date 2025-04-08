"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { ILesson } from "@/services/interface/CourseDto";
import {
  getlessons,
  addnewLesson,
  savelessonchanges,
  deleteLessonApi,
} from "@/services/fetchdata";

export function useLessonRepository(courseid?: string) {
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  console.log(lessons, "eslsldfasdfahsdkfash");

  // Fetch lessons for a course
  const fetchLessons = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await getlessons(courseId);
      console.log("responce of get lessons", response.data);

      setLessons(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to fetch lessons");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new lesson
  const addLesson = useCallback(async (lessonData: any, courseId: string) => {
    setIsLoading(true);
    try {
      const newLesson = await addnewLesson(lessonData, courseId);
      console.log(newLesson, "newLesson", lessonData);

      setLessons((prev) => [...prev, lessonData]);
      return newLesson;
    } catch (error) {
      console.error("Error adding lesson:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a lesson
  const updateLesson = useCallback(
    async (lessonData: ILesson, courseid: string) => {
      setIsLoading(true);
      try {
        const updatedLesson = await savelessonchanges(
          lessonData._id,
          lessonData,
          courseid
        );
        console.log(updatedLesson, "updated datais", lessonData, lessons);

        setLessons((prev) =>
          prev.map((lesson) =>
            lesson._id === lessonData._id ? lessonData : lesson
          )
        );
        return updatedLesson;
      } catch (error) {
        console.error("Error updating lesson:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete a lesson
  const deleteLesson = useCallback(async (lessonId: string) => {
    setIsLoading(true);
    try {
      await deleteLessonApi(courseid, lessonId);
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    lessons,
    isLoading,
    fetchLessons,
    addLesson,
    updateLesson,
    deleteLesson,
  };
}

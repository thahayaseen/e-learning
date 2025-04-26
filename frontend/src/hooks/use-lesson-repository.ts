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
   // Fetch lessons for a course
  const fetchLessons = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await getlessons(courseId);
       setLessons(response.data || []);
      return response.data;
    } catch (error) {
 
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
       setLessons((prev) => [...prev, lessonData]);
      return newLesson;
    } catch (error) {
 
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
         setLessons((prev) =>
          prev.map((lesson) =>
            lesson._id === lessonData._id ? lessonData : lesson
          )
        );
        return updatedLesson;
      } catch (error) {
 
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

"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLessonRepository } from "@/hooks/use-lesson-repository";
import { useCategoryRepository } from "@/hooks/use-category-repository";
import AddLessonModal from "@/components/courses/addlesson";
import EditLessonDialog from "@/components/courses/editCourse";
import type { ICourses, ILesson } from "@/services/interface/CourseDto";

// Course validation schema
const courseSchema = z.object({
  Title: z.string().min(4, "Title must be more than 4 letters"),
  Description: z.string().min(5, "Description must be more than 5 letters"),
  Price: z.coerce.number().positive("Price cannot be less than 0"),
  Category: z.string().optional(),
  Content: z.string().optional(),
});

interface CourseEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: ICourses;
  onUpdate: (courseId: string, courseData: any) => Promise<void>;
  onDelete: (courseId: string) => Promise<void>;
}

export default function CourseEditDialog({
  isOpen,
  onClose,
  course,
  onUpdate,
  onDelete,
}: CourseEditDialogProps) {
  console.log(JSON.stringify(course), "cours id ");

  const [courseData, setCourseData] = useState<any>({
    Title: course.Title,
    Description: course.Description,
    Price: course.Price,
    Category: course.Category._id,
    Content: course.Content,
  });
  console.log(courseData);
  useEffect(() => {
    setCourseData({
      Title: course.Title,
      Description: course.Description,
      Price: course.Price,
      Category: course.Category._id,
      Content: course.Content,
    });
  }, [course]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);

  const { lessons, fetchLessons, addLesson, updateLesson, deleteLesson } =
    useLessonRepository(course._id);
  const { categories, fetchCategories } = useCategoryRepository();

  // Fetch lessons and categories when dialog opens
  useEffect(() => {
    if (isOpen && course._id) {
      fetchLessons(course._id);
      fetchCategories();
    }
  }, [isOpen, course._id, fetchLessons, fetchCategories]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Clear the error for this field when the user makes changes
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }

    // Handle different input types
    if (name === "Price") {
      // Convert price to number
      setCourseData({
        ...courseData,
        [name]: value === "" ? "" : Number.parseFloat(value),
      });
    } else {
      // Handle text inputs
      setCourseData({
        ...courseData,
        [name]: value,
      });
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate with Zod
      courseSchema.parse(courseData);

      // Clear any previous errors
      setFormErrors({});

      // Call API to update course
      setIsLoading(true);
      await onUpdate(course._id, courseData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });
        setFormErrors(errors);

        // Show toast for the first error
        const firstError = error.errors[0];
        toast.error(`Validation Error: ${firstError.message}`, {
          description: `Please check the ${firstError.path[0]} field`,
        });
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLesson = (lesson: ILesson) => {
    setSelectedLesson(lesson);
    setIsEditLessonOpen(true);
  };

  const handleDeleteCourse = async () => {
    try {
      setIsLoading(true);
      await onDelete(course._id);
      onClose();
    } catch (error) {
      toast.error("Failed to delete course", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-blue-900 text-white border-blue-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Edit Course
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Make changes to your course details below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveChanges}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="Title" className="text-white">
                    Course Title
                  </Label>
                  <Input
                    id="Title"
                    name="Title"
                    value={courseData.Title}
                    onChange={handleInputChange}
                    className={`bg-blue-800 border-blue-700 text-white focus:border-blue-500 ${
                      formErrors.Title ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.Title && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.Title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="Description"
                    name="Description"
                    value={courseData.Description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`bg-blue-800 border-blue-700 text-white focus:border-blue-500 ${
                      formErrors.Description ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.Description && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.Description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Price" className="text-white">
                    Price (₹)
                  </Label>
                  <Input
                    id="Price"
                    name="Price"
                    type="number"
                    value={courseData.Price}
                    onChange={handleInputChange}
                    className={`bg-blue-800 border-blue-700 text-white focus:border-blue-500 ${
                      formErrors.Price ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.Price && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.Price}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Category" className="text-white">
                    Category
                  </Label>
                  <select
                    id="Category"
                    name="Category"
                    value={courseData.Category}
                    onChange={handleInputChange}
                    className={`bg-blue-800 border-blue-700 text-white focus:border-blue-500 p-2 rounded-md w-full ${
                      formErrors.Category ? "border-red-500" : ""
                    }`}>
                    <option value="">Select a Category</option>
                    {categories.map((category: any) => (
                      <option key={category._id} value={category._id}>
                        {category.Category}
                      </option>
                    ))}
                  </select>
                  {formErrors.Category && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.Category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Content" className="text-white">
                    Content (Optional)
                  </Label>
                  <Textarea
                    id="Content"
                    name="Content"
                    value={courseData.Content}
                    onChange={handleInputChange}
                    rows={4}
                    className={`bg-blue-800 border-blue-700 text-white focus:border-blue-500 ${
                      formErrors.Content ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.Content && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.Content}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden border border-blue-700">
                  <div className="bg-blue-700 text-white p-3 font-medium flex items-center justify-between">
                    <span>Course Lessons</span>
                    <Badge className="bg-blue-900 text-blue-200">
                      {lessons.length}
                    </Badge>
                  </div>

                  <div className="divide-y divide-blue-700 max-h-96 overflow-y-auto bg-blue-800">
                    {lessons.length > 0 ? (
                      lessons.map((lesson, index) => (
                        <div
                          key={lesson._id}
                          className="p-3 hover:bg-blue-700 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-900 text-blue-300 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="line-clamp-1">
                              {lesson.Lessone_name}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleEditLesson(lesson)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-300 hover:text-white hover:bg-blue-600">
                            <Edit size={14} />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-blue-400">
                        No lessons found for this course
                      </div>
                    )}
                  </div>
                  <div className="border-t border-blue-700 p-3 bg-blue-800 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-blue-200 border-blue-600 hover:bg-blue-700 hover:text-white flex items-center gap-1"
                      onClick={() => setIsAddLessonOpen(true)}>
                      <Plus size={16} />
                      <span>Add Lesson</span>
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-blue-300 hover:bg-blue-700"
                        onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                        disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Course statistics and additional information */}
                <div className="mt-6 rounded-lg border border-blue-700 overflow-hidden">
                  <div className="bg-blue-700 p-3 font-medium text-white">
                    Course Statistics
                  </div>
                  <div className="p-4 bg-blue-800 grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="text-blue-300 text-sm flex items-center gap-1">
                        <Users size={14} /> Students Enrolled
                      </div>
                      <div className="text-white text-lg font-medium">
                        {course.Students_enrolled?.length || 0}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-blue-300 text-sm flex items-center gap-1">
                        <Calendar size={14} /> Created On
                      </div>
                      <div className="text-white text-lg font-medium">
                        {formatDate(course.CreatedAt)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-blue-300 text-sm flex items-center gap-1">
                        <Clock size={14} /> Last Updated
                      </div>
                      <div className="text-white text-lg font-medium">
                        {formatDate(course.UpdatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-400 border-red-800 hover:bg-red-900 hover:text-red-200 flex items-center gap-1"
                    onClick={handleDeleteCourse}>
                    <Trash2 size={16} />
                    <span>Delete Course</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 text-sm">
                      Course Status:
                    </span>
                    {course.Approved_by_admin === "approved" ? (
                      <Badge className="bg-green-600 text-white flex items-center gap-1">
                        <CheckCircle size={12} /> Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-600 text-white">
                        {course.Approved_by_admin === "pending"
                          ? "Pending Approval"
                          : course.Approved_by_admin}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Modal */}
      {isAddLessonOpen && (
        <AddLessonModal
          course={course}
          isOpen={isAddLessonOpen}
          onClose={() => setIsAddLessonOpen(false)}
          onSave={async (newLesson, task) => {
            try {
              await addLesson(newLesson, course._id);
              setIsAddLessonOpen(false);
              toast.success("Lesson created successfully");
              // Refresh lessons
              fetchLessons(course._id);
            } catch (error) {
              toast.error("Failed to create lesson");
            }
          }}
        />
      )}

      {/* Edit Lesson Dialog */}
      {selectedLesson && (
        <EditLessonDialog
          isOpen={isEditLessonOpen}
          onClose={() => setIsEditLessonOpen(false)}
          lesson={selectedLesson}
          course={course}
          onSave={async (updatedLesson) => {
            try {
              await updateLesson(updatedLesson, course._id);
              setIsEditLessonOpen(false);
              toast.success("Lesson updated successfully");
              // Refresh lessons
              fetchLessons(course._id);
            } catch (error) {
              toast.error("Failed to update lesson");
            }
          }}
          courses={[course]}
          setCourses={() => {}}
        />
      )}
    </>
  );
}

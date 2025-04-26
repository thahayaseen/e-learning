"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
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
  Eye,
  EyeOff,
  Plus,
  Upload,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLessonRepository } from "@/hooks/use-lesson-repository";
import { useCategoryRepository } from "@/hooks/use-category-repository";
import AddLessonModal from "@/components/courses/addlesson";
import EditLessonDialog from "@/components/courses/editcourse/editCourse";
import type { ICourses, ILesson } from "@/services/interface/CourseDto";
import Image from "next/image";

import useUploadS3 from "@/hooks/addtos3";
import { unlistCourse } from "@/services/fetchdata";
import { getImage } from "@/services/getImage";

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
  onAction: (courseId: string) => Promise<void>;
}

export default function CourseEditDialog({
  isOpen,
  onClose,
  course,
  onUpdate,
  onAction,
}: CourseEditDialogProps) {
  const courseImageRef = useRef<HTMLInputElement | null>(null);
  const [courseData, setCourseData] = useState<any>({
    Title: course.Title,
    Description: course.Description,
    Price: course.Price,
    Category: course.Category._id,
    Content: course.Content,
    image: `${getImage(course.image)}`,
    unlist: course.unlist || false,
  });

  useEffect(() => {
    setCourseData({
      Title: course.Title,
      Description: course.Description,
      Price: course.Price,
      Category: course.Category._id,
      Content: course.Content,
      image: `${getImage(course.image)}`,
      unlist: course.unlist || false,
    });
  }, [course]);

  const { uploading, uploadtos3 } = useUploadS3();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);

  const { lessons, fetchLessons, addLesson, updateLesson } = useLessonRepository(course._id);
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
    const { name, value } = e.target;

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

  const handleChangeCourseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImageUploading(true);
      const url = await uploadtos3(file, "image");
      setCourseData({
        ...courseData,
        image: url,
      });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
 
    } finally {
      setIsImageUploading(false);
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
      if (course.Approved_by_admin !== "approved") {
         onUpdate(course._id, courseData)
       
      }
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
        
 
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrEditLesson = (lesson: ILesson) => {
    setSelectedLesson(lesson);
    setIsEditLessonOpen(true);
  };

  const handleToggleCourseVisibility = async () => {
    try {
      setIsLoading(true);
      // Toggle the unlist status
      const updatedData = {
        ...courseData,
        unlist: !courseData.unlist,
      };
      
      setCourseData(updatedData);
      await unlistCourse(course._id);
      toast.success(updatedData.unlist ? "Course unlisted successfully" : "Course listed successfully");
    } catch (error) {
      toast.error("Failed to update course visibility");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Edit Course
            </DialogTitle>
            <DialogDescription className="text-gray-300">
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
                    className={`bg-gray-800 border-gray-700 text-white focus:border-indigo-500 ${
                      formErrors.Title ? "border-red-500" : ""
                    }`}
                    disabled={course.Approved_by_admin === "approved"}
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
                    className={`bg-gray-800 border-gray-700 text-white focus:border-indigo-500 ${
                      formErrors.Description ? "border-red-500" : ""
                    }`}
                    disabled={course.Approved_by_admin === "approved"}
                  />
                  {formErrors.Description && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.Description}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Course Image</Label>
                  <div className="relative rounded-md overflow-hidden border border-gray-700 h-48 flex items-center justify-center bg-gray-800">
                    <input
                      type="file"
                      ref={courseImageRef}
                      onChange={handleChangeCourseImage}
                      accept="image/*"
                      hidden
                      disabled={course.Approved_by_admin === "approved"}
                    />
                    {courseData.image ? (
                      <Image
                        src={courseData.image}
                        className="object-contain w-full h-full"
                        width={400}
                        height={300}
                        alt="Course Image"
                      />
                    ) : (
                      <div className="text-gray-400">No image selected</div>
                    )}
                    {course.Approved_by_admin !== "approved" && (
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => courseImageRef.current?.click()}
                      >
                        <Upload size={32} className="text-white mb-2" />
                        <span className="text-white text-sm">
                          {isImageUploading ? "Uploading..." : "Change Image"}
                        </span>
                      </div>
                    )}
                  </div>
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
                    className={`bg-gray-800 border-gray-700 text-white focus:border-indigo-500 ${
                      formErrors.Price ? "border-red-500" : ""
                    }`}
                    disabled={course.Approved_by_admin === "approved"}
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
                    className={`bg-gray-800 border-gray-700 text-white focus:border-indigo-500 p-2 rounded-md w-full ${
                      formErrors.Category ? "border-red-500" : ""
                    }`}
                    disabled={course.Approved_by_admin === "approved"}>
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
                    className={`bg-gray-800 border-gray-700 text-white focus:border-indigo-500 ${
                      formErrors.Content ? "border-red-500" : ""
                    }`}
                    disabled={course.Approved_by_admin === "approved"}
                  />
                  {formErrors.Content && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.Content}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden border border-gray-700">
                  <div className="bg-gray-800 text-white p-3 font-medium flex items-center justify-between">
                    <span>Course Lessons</span>
                    <Badge className="bg-indigo-700 text-white">
                      {lessons.length}
                    </Badge>
                  </div>

                  <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto bg-gray-900">
                    {lessons.length > 0 ? (
                      lessons.map((lesson, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-800 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="line-clamp-1">
                              {lesson.Lessone_name}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleViewOrEditLesson(lesson)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-300 hover:text-white hover:bg-gray-700">
                            {course.Approved_by_admin === "approved" ? (
                              <Eye size={14} />
                            ) : (
                              <Edit size={14} />
                            )}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        No lessons found for this course
                      </div>
                    )}
                  </div>
                  <div
                    className={`border-t border-gray-700 p-3 bg-gray-800 flex items-center ${
                      course.Approved_by_admin !== "approved"
                        ? "justify-between"
                        : "justify-end"
                    }`}>
                    {course.Approved_by_admin !== "approved" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="text-white border-indigo-600 hover:bg-indigo-700 hover:text-white flex items-center gap-1"
                        onClick={() => setIsAddLessonOpen(true)}>
                        <Plus size={16} />
                        <span>Add Lesson</span>
                      </Button>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-white bg-gray-800 hover:bg-gray-700"
                        onClick={onClose}>
                        {course.Approved_by_admin === "approved"
                          ? "Close"
                          : "Cancel"}
                      </Button>
                      {course.Approved_by_admin !== "approved" && (
                        <Button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white"
                          disabled={isLoading || isImageUploading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course statistics and additional information */}
                <div className="mt-6 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="bg-gray-800 p-3 font-medium text-white">
                    Course Statistics
                  </div>
                  <div className="p-4 bg-gray-900 grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="text-gray-300 text-sm flex items-center gap-1">
                        <Users size={14} /> Students Enrolled
                      </div>
                      <div className="text-white text-lg font-medium">
                        {course.Students_enrolled?.length || 0}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-300 text-sm flex items-center gap-1">
                        <Calendar size={14} /> Created On
                      </div>
                      <div className="text-white text-lg font-medium">
                        {formatDate(course.CreatedAt)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-300 text-sm flex items-center gap-1">
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
                    className={`border flex items-center gap-2 ${
                      courseData.unlist 
                        ? 'text-white border-emerald-600 hover:bg-emerald-800' 
                        : 'text-white border-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={handleToggleCourseVisibility}
                    disabled={isLoading}>
                    {courseData.unlist ? (
                      <>
                        <Eye size={16} />
                        <span>List Course</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} />
                        <span>Unlist Course</span>
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-sm">
                      Course Status:
                    </span>
                    {course.Approved_by_admin === "approved" ? (
                      <Badge className="bg-emerald-600 text-white flex items-center gap-1">
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
          onSave={async (newLesson) => {
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
          viewOnly={course.Approved_by_admin === "approved" }
        />
      )}
    </>
  );
}
"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Edit,
  FilePlus,
  Video,
  FileQuestion,
  FileText,
  ImageIcon,
  Save,
  MoreVertical,
  Upload,
  X,
  Loader2,
  IndianRupee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addCourse, allCategorys } from "@/services/fetchdata";
import { toast } from "sonner";
import Image from "next/image";

// Define our validation schemas using zod
const courseFormSchema = z.object({
  Title: z.string().min(1, "Title is required"),
  Description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
  Price: z.coerce.number().min(0, "Price cannot be negative"),
  Category: z.string().min(1, "Category is required"),
  Content: z.string().optional(),
});

const lessonFormSchema = z.object({
  Lessone_name: z.string().min(1, "Lesson name is required"),
  Content: z.string().min(10, "Content should be at least 10 characters"),
});

const QuizFormSchema = z.object({
  Question: z.string().min(1, "Question is required"),
  Options: z.array(z.string()).min(2, "At least two options are required"),
  Answer: z.string().min(1, "Correct answer is required"),
});

const assignmentFormSchema = z.object({
  Description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
});

const videoFormSchema = z.object({
  VideoFile: z.any().optional(),
});

interface MentorCourseCreationProps {
  toggle: () => void;
  setCourses:any
}

const MentorCourseCreation: React.FC<MentorCourseCreationProps> = ({
  toggle,setCourses
}) => {
  const [courseData, setCourseData] = useState({
    Title: "",
    Description: "",
    Price: 0,
    Category: "",
    Content: "",
    lessons: [],
    image: "",
    imagssss: "",
  });

  const [categories, setCategory] = useState<any[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(
    null
  );
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTaskType, setCurrentTaskType] = useState("Quiz");
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // Video upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cfn = async () => {
      const dat = await allCategorys();
      setCategory(dat);
    };
    cfn();
    console.log("Fetching categories");
  }, []);

  // Course form setup
  const courseForm = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: courseData,
  });

  // Lesson form setup
  const lessonForm = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      Lessone_name: "",
      Content: "",
    },
  });

  // Quiz form setup
  const QuizForm = useForm({
    resolver: zodResolver(QuizFormSchema),
    defaultValues: {
      Question: "",
      Options: ["", "", "", ""],
      Answer: "",
    },
  });

  // Assignment form setup
  const assignmentForm = useForm({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      Description: "",
    },
  });

  // Video form setup
  const videoForm = useForm({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      VideoFile: null,
    },
  });

  // Upload file to S3 using pre-signed URL
  const uploadToS3 = async (file: File, fileType = "image") => {
    if (!file) return null;

    try {
      setUploading(fileType === "image");
      setUploadingVideo(fileType === "video");

      // 1. Get Pre-signed URL from API Route
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileCategory: fileType, // Add category to differentiate between image and video
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl } = await res.json();
      console.log(uploadUrl);
      console.log(file);
      console.log("type is ", file.type);

      // 2. Upload file to S3 using pre-signed URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      console.log(uploadRes);

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // Get actual S3 image URL (remove query parameters)
      const fileUrl = uploadUrl.split("?")[0];

      if (fileType === "image") {
        console.log("Image URL:", fileUrl);

        // Update courseData with the new image URL
        setCourseData((prevData) => ({
          ...prevData,
          image: fileUrl,
        }));
      } else if (fileType === "video") {
        setVideoUrl(fileUrl);
      }

      return fileUrl;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast.error("Upload Error", {
        description: `Failed to upload ${fileType}. Please try again.`,
      });
      return null;
    } finally {
      setUploading(false);
      setUploadingVideo(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video upload
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("changes");

    const file = e.target.files?.[0];

    if (file) {
      console.log(file);
      setVideoFile(file);
      videoForm.setValue("VideoFile", file);

      // Create a preview URL if it's a video file
      if (file.type.startsWith("video/")) {
        const videoPreviewUrl = URL.createObjectURL(file);
        setVideoPreview(videoPreviewUrl);
      }
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCourseData((prevData) => ({
      ...prevData,
      image: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove uploaded video
  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl(null);
    videoForm.setValue("VideoFile", null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // Form submission handlers
  const onCourseSubmit = async (data: any) => {
    try {
      console.log("Course form submitted");

      // Upload image if exists
      let finalImageUrl = courseData.image;
      if (imageFile && !courseData.image) {
        finalImageUrl = await uploadToS3(imageFile, "image");
        if (!finalImageUrl) {
          throw new Error("Failed to upload image");
        }
      }
      console.log("Final image URL:", finalImageUrl);

      // Update course data with form data and image URL
      const updatedCourseData = {
        ...courseData,
        ...data,
      };

      setCourseData(updatedCourseData);
      console.log("Course data updated:", updatedCourseData);
      return updatedCourseData;
    } catch (error) {
      console.error("Error in course submission:", error);
      toast.error("Error", {
        description: "Failed to save course data. Please try again.",
      });
      return null;
    }
  };

  const addNewLesson = () => {
    lessonForm.reset({
      Lessone_name: "",
      Content: "",
    });
    setCurrentLessonIndex(null);
    setShowLessonModal(true);
  };

  const editLesson = (index: number) => {
    const lesson = courseData.lessons[index];
    lessonForm.reset({
      Lessone_name: lesson.Lessone_name,
      Content: lesson.Content,
    });
    setCurrentLessonIndex(index);
    setShowLessonModal(true);
  };

  const onLessonSubmit = (data: any) => {
    const updatedLessons = [...courseData.lessons];
    const lessonToSave = {
      ...data,
      Task:
        currentLessonIndex !== null
          ? courseData.lessons[currentLessonIndex].Task || []
          : [],
    };

    if (currentLessonIndex !== null) {
      updatedLessons[currentLessonIndex] = lessonToSave;
    } else {
      updatedLessons.push(lessonToSave);
    }

    setCourseData({ ...courseData, lessons: updatedLessons });
    setShowLessonModal(false);
  };

  const deleteLesson = (index: number) => {
    const updatedLessons = [...courseData.lessons];
    updatedLessons.splice(index, 1);
    setCourseData({ ...courseData, lessons: updatedLessons });
  };

  const addNewTask = (lessonIndex: number, type: string) => {
    // Capitalize the first letter of task type
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

    setCurrentLessonIndex(lessonIndex);
    setCurrentTaskType(capitalizedType);
    setCurrentTaskIndex(null);
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl(null);

    if (capitalizedType === "Quiz") {
      QuizForm.reset({
        Question: "",
        Options: ["", "", "", ""],
        Answer: "",
      });
    } else if (capitalizedType === "Assignment") {
      assignmentForm.reset({
        Description: "",
      });
    } else if (capitalizedType === "Video") {
      videoForm.reset({
        VideoFile: null,
      });
    }

    setShowTaskModal(true);
  };

  const editTask = (lessonIndex: number, taskIndex: number) => {
    const task = courseData.lessons[lessonIndex].Task[taskIndex];
    setCurrentLessonIndex(lessonIndex);
    setCurrentTaskIndex(taskIndex);

    // Ensure task type is capitalized
    const capitalizedType =
      task.Type.charAt(0).toUpperCase() + task.Type.slice(1);
    setCurrentTaskType(capitalizedType);
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl(null);

    if (capitalizedType === "Quiz") {
      QuizForm.reset({
        Question: task.Question,
        Options: task.Options,
        Answer: task.Answer,
      });
    } else if (capitalizedType === "Assignment") {
      assignmentForm.reset({
        Description: task.Description,
      });
    } else if (capitalizedType === "Video") {
      videoForm.reset({
        VideoFile: null,
      });

      // If there's an S3 video URL, set it
      if (task.VideoURL) {
        setVideoUrl(task.VideoURL);
      }
    }

    setShowTaskModal(true);
  };

  const onQuizSubmit = (data: any) => {
    saveTaskData({
      Type: "Quiz",
      ...data,
    });
  };

  const onAssignmentSubmit = (data: any) => {
    saveTaskData({
      Type: "Assignment",
      ...data,
    });
  };

  const onVideoSubmit = async (data: any) => {
    try {
      // Handle video file upload if present
      console.log("in video submit");

      let finalVideoUrl = videoUrl;
      if (videoFile && !videoUrl) {
        setUploadingVideo(true);
        finalVideoUrl = await uploadToS3(videoFile, "video");
        setUploadingVideo(false);
      }

      saveTaskData({
        Type: "Video", // Capitalized
        VideoURL: finalVideoUrl || "",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Upload Error", {
        description: "Failed to upload video. Please try again.",
      });
    }
  };

  const saveTaskData = (taskData: any) => {
    const updatedLessons = [...courseData.lessons];
    const currentLesson = { ...updatedLessons[currentLessonIndex as number] };

    if (!currentLesson.Task) {
      currentLesson.Task = [];
    }

    if (currentTaskIndex !== null) {
      currentLesson.Task[currentTaskIndex] = taskData;
    } else {
      currentLesson.Task.push(taskData);
    }

    updatedLessons[currentLessonIndex as number] = currentLesson;
    setCourseData({ ...courseData, lessons: updatedLessons });
    setShowTaskModal(false);
  };

  const deleteTask = (lessonIndex: number, taskIndex: number) => {
    const updatedLessons = [...courseData.lessons];
    updatedLessons[lessonIndex].Task.splice(taskIndex, 1);
    setCourseData({ ...courseData, lessons: updatedLessons });
  };

  const saveCourse = async () => {
    try {
      // Validate form fields first
      const isFormValid = await courseForm.trigger();
      if (!isFormValid) {
        toast.error("Validation Error", {
          description: "Please correct the errors in your course details",
        });
        return;
      }

      // Check if there's at least one lesson
      if (courseData.lessons.length === 0) {
        toast.error("Validation Error", {
          description: "You must add at least one lesson",
        });
        return;
      }
      let imageUrl;
      // Check if image is uploaded
      if (!courseData.image && imageFile) {
        // Upload the image first
        imageUrl = await uploadToS3(imageFile, "image");
        if (!imageUrl) {
          toast.error("Upload Error", {
            description: "Failed to upload course image",
          });
          return;
        }
        console.log("Image URL from saveCourse:", imageUrl);
      }
      console.log(imageUrl);

      // Get the form values
      const formValues = courseForm.getValues();

      // Combine form values with courseData
      const finalCourseData = {
        ...courseData,
        image: imageUrl,
        Title: formValues.Title,
        Description: formValues.Description,
        Price: formValues.Price,
        Category: formValues.Category,
        Content: formValues.Content,
      };

      console.log("Course data to be saved:", finalCourseData);

      // Send data to API
      const result = await addCourse(finalCourseData);
      console.log("API response:", result.results);
      setCourses(prev=>[...prev,result.results])

      if (result.success) {
        toast.success("Success", {
          description: "Course saved successfully!",
        });
        toggle(); // Close the form after successful save
      } else if (!result.success) {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Error", {
        description: "Failed to save course. Please try again.",
      });
    }
  };

  // Helper function to get task icon based on type
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "Quiz":
        return <FileQuestion className="mr-2 h-4 w-4" />;
      case "Assignment":
        return <FileText className="mr-2 h-4 w-4" />;
      case "Video":
      case "video":
        return <Video className="mr-2 h-4 w-4" />;
      default:
        return <FilePlus className="mr-2 h-4 w-4" />;
    }
  };

  // Helper function to get task name based on type
  const getTaskName = (type: string) => {
    switch (type) {
      case "Quiz":
        return "Quiz";
      case "Assignment":
        return "Assignment";
      case "Video":
      case "video":
        return "Video";
      default:
        return "Task";
    }
  };

  // Helper function to get task description
  const getTaskDescription = (task: any) => {
    if (task.Type === "Quiz") {
      return "Question: " + (task.Question || "No question added");
    } else if (task.Type === "Assignment") {
      return (
        task.Description?.substring(0, 50) +
          (task.Description?.length > 50 ? "..." : "") || "No description added"
      );
    } else if (task.Type === "Video" || task.Type === "video") {
      if (task.VideoURL) {
        return "Video uploaded to S3";
      } else {
        return "Video URL: " + (task.VideoURL || "No URL added");
      }
    }
    return "";
  };

  // Debug: Log courseData whenever it changes
  useEffect(() => {
    console.log("courseData updated:", courseData);
  }, [courseData]);

  return (
    <div className="fixed w-[80vw] my-3 z-50 py-0 bg-gray-50/80 backdrop-blur-sm overflow-y-auto max-h-[100vh]">
      <Card className=" shadow-lg border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold text-blue-800">
            Create New Course
          </CardTitle>
          <CardDescription className="text-blue-600">
            Fill out the details to create a new course. Add lessons and tasks
            to structure your course content.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[70vh]">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-50">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Basic Details
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="lessons"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Lessons & Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <Form {...courseForm}>
                <form
                  onSubmit={courseForm.handleSubmit(onCourseSubmit)}
                  className="space-y-6">
                  <FormField
                    control={courseForm.control}
                    name="Title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700">
                          Course Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter course title"
                            {...field}
                            className="border-blue-200 text-white focus:border-blue-500 hover:border-blue-400"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="Description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write a detailed description"
                            className="min-h-16 border-blue-200 text-white focus:border-blue-500 hover:border-blue-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={courseForm.control}
                      name="Category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">
                            Category
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-blue-200 text-white focus:border-blue-500 hover:border-blue-400">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category._id}
                                  value={category._id}>
                                  {category.Category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={courseForm.control}
                      name="Price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">
                            Price (Rs)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                              <Input
                                type="number"
                                className="pl-10 border-blue-200 text-white focus:border-blue-500 hover:border-blue-400"
                                placeholder="0.00"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <FormLabel className="text-blue-700">
                      Course Cover Image
                    </FormLabel>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:bg-blue-50 transition-colors">
                      {!imagePreview ? (
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-blue-400" />
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-blue-600 border-blue-300 hover:bg-blue-100">
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Image
                            </Button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          {uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                              <span className="ml-2 text-blue-600 font-medium">
                                Uploading...
                              </span>
                            </div>
                          ) : null}
                          <Image
                          width={100}
                          height={10}
                            src={imagePreview || "/placeholder.svg"}
                            alt="Course cover preview"
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                            onClick={removeImage}>
                            <X className="h-4 w-4" />
                          </Button>
                          <p className="text-sm text-blue-600 mt-2 font-medium">
                            {imageFile?.name}
                          </p>
                          {courseData.image && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Uploaded to S3:{" "}
                              {courseData.image.split("/").pop()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <Form {...courseForm}>
                <form className="space-y-4">
                  <FormField
                    control={courseForm.control}
                    name="Content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700">
                          Course Overview Content
                        </FormLabel>
                        <FormDescription className="text-blue-600">
                          This content will be shown on the course landing page
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Add detailed information about the course"
                            className="min-h-64 border-blue-200 focus:border-blue-500 hover:border-blue-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="lessons" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-blue-800">
                  Course Lessons
                </h3>
                <Button
                  onClick={addNewLesson}
                  className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Lesson
                </Button>
              </div>

              {courseData.lessons.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                  <ImageIcon className="mx-auto h-12 w-12 text-blue-300" />
                  <p className="text-blue-600 mt-4">
                    No lessons added yet. Click "Add Lesson" to get started.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {courseData.lessons.map((lesson, lessonIndex) => (
                    <AccordionItem
                      key={lessonIndex}
                      value={`lesson-${lessonIndex}`}
                      className="border border-blue-100 rounded-md mb-2 overflow-hidden">
                      <div className="flex items-center justify-between bg-blue-50 hover:bg-blue-100">
                        <AccordionTrigger className="text-left text-blue-700 px-4 py-2 hover:no-underline hover:text-blue-800">
                          {lesson.Lessone_name || `Lesson ${lessonIndex + 1}`}
                        </AccordionTrigger>
                        <div className="flex mr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-200">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => editLesson(lessonIndex)}
                                className="text-blue-600 hover:bg-blue-50">
                                <Edit className="mr-2 h-4 w-4" /> Edit Lesson
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => deleteLesson(lessonIndex)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                Lesson
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <AccordionContent className="bg-white">
                        <div className="pl-4 border-l-2 border-blue-200 ml-2 mt-2">
                          <div className="mb-4">
                            <p className="text-sm text-blue-500">
                              Lesson Content:
                            </p>
                            <p className="text-sm">
                              {lesson.Content || "No content added"}
                            </p>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-blue-700">
                                Tasks
                              </h4>
                              <div className="space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    addNewTask(lessonIndex, "Quiz")
                                  }
                                  className="border-blue-300 text-blue-700 hover:bg-blue-100">
                                  <FileQuestion className="mr-2 h-4 w-4" /> Add
                                  Quiz
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    addNewTask(lessonIndex, "Assignment")
                                  }
                                  className="border-blue-300 text-blue-700 hover:bg-blue-100">
                                  <FileText className="mr-2 h-4 w-4" /> Add
                                  Assignment
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    addNewTask(lessonIndex, "Video")
                                  }
                                  className="border-blue-300 text-blue-700 hover:bg-blue-100">
                                  <Video className="mr-2 h-4 w-4" /> Add Video
                                </Button>
                              </div>
                            </div>

                            {lesson.Task && lesson.Task.length > 0 ? (
                              <div className="space-y-2">
                                {lesson.Task.map((task, taskIndex) => (
                                  <div
                                    key={taskIndex}
                                    className="flex items-center justify-between p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors border border-blue-100">
                                    <div className="flex items-center">
                                      {getTaskIcon(task.Type)}
                                      <div>
                                        <div className="flex items-center">
                                          <span className="font-medium text-blue-800">
                                            {getTaskName(task.Type)}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                                            {task.Type}
                                          </Badge>
                                          {task.VideoURL && (
                                            <Badge
                                              variant="outline"
                                              className="ml-2 bg-green-100 text-green-800 border-green-300">
                                              S3 Uploaded
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-blue-600">
                                          {getTaskDescription(task)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          editTask(lessonIndex, taskIndex)
                                        }
                                        className="text-blue-600 hover:bg-blue-200">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          deleteTask(lessonIndex, taskIndex)
                                        }
                                        className="text-red-500 hover:bg-red-100">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-blue-400 italic bg-blue-50 p-4 rounded-md">
                                No tasks added to this lesson yet.
                              </p>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 sticky bottom-0 z-10">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {}}
                className="border-red-300 text-red-600 hover:bg-red-50">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your progress will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-blue-200 text-blue-700">
                  Continue Editing
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={toggle}>
                  Yes, discard changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={saveCourse}
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Course
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Lesson Modal */}
      <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              {currentLessonIndex !== null ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
            <DialogDescription>
              Enter the details for this lesson.
            </DialogDescription>
          </DialogHeader>

          <Form {...lessonForm}>
            <form
              onSubmit={lessonForm.handleSubmit(onLessonSubmit)}
              className="space-y-4 py-4">
              <FormField
                control={lessonForm.control}
                name="Lessone_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700">Lesson Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter lesson name"
                        {...field}
                        className="border-blue-200 focus:border-blue-500 hover:border-blue-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={lessonForm.control}
                name="Content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700">
                      Lesson Content
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter lesson content"
                        className="min-h-32 border-blue-200 focus:border-blue-500 hover:border-blue-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Lesson
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              {currentTaskIndex !== null
                ? `Edit ${getTaskName(currentTaskType)}`
                : `Add New ${getTaskName(currentTaskType)}`}
            </DialogTitle>
            <DialogDescription>
              Enter the details for this task.
            </DialogDescription>
          </DialogHeader>

          {currentTaskType === "Quiz" && (
            <Form {...QuizForm}>
              <form
                onSubmit={QuizForm.handleSubmit(onQuizSubmit)}
                className="space-y-4 py-4">
                <FormField
                  control={QuizForm.control}
                  name="Question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700">Question</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter quiz question"
                          className="border-blue-200 focus:border-blue-500 hover:border-blue-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={QuizForm.control}
                  name="Options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700">Options</FormLabel>
                      <div className="space-y-2">
                        {field.value.map((option, index) => (
                          <div className="flex gap-2" key={index}>
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...field.value];
                                newOptions[index] = e.target.value;
                                field.onChange(newOptions);
                              }}
                              className="border-blue-200 focus:border-blue-500 hover:border-blue-400"
                            />
                          </div>
                        ))}
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={QuizForm.control}
                  name="Answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700">
                        Correct Answer
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter correct answer"
                          className="border-blue-200 focus:border-blue-500 hover:border-blue-400"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-blue-600">
                        Must exactly match one of the options
                      </FormDescription>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Quiz
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {currentTaskType === "Assignment" && (
            <Form {...assignmentForm}>
              <form
                onSubmit={assignmentForm.handleSubmit(onAssignmentSubmit)}
                className="space-y-4 py-4">
                <FormField
                  control={assignmentForm.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700">
                        Assignment Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter assignment description"
                          className="min-h-32 border-blue-200 focus:border-blue-500 hover:border-blue-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Assignment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {currentTaskType === "Video" && (
            <Form {...videoForm}>
              <form
                onSubmit={videoForm.handleSubmit(onVideoSubmit)}
                className="space-y-4 py-4">
                <div className="space-y-4">
                  {/* Video Upload Section */}
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                      {!videoPreview && !videoUrl ? (
                        <div className="text-center">
                          <Video className="mx-auto h-10 w-10 text-blue-400" />
                          <div className="mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => videoInputRef.current?.click()}
                              className="text-blue-600 border-blue-300 hover:bg-blue-100">
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Video
                            </Button>
                            <input
                              type="file"
                              ref={videoInputRef}
                              onChange={handleVideoChange}
                              accept="video/*"
                              className="hidden"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            MP4, WebM, MOV up to 100MB
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          {uploadingVideo ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                              <span className="ml-2 text-blue-600 font-medium">
                                Uploading video...
                              </span>
                            </div>
                          ) : null}

                          {videoPreview && (
                            <video
                              src={videoPreview}
                              controls
                              className="w-full h-32 object-cover rounded-md"
                            />
                          )}

                          {videoUrl && !videoPreview && (
                            <div className="flex items-center justify-center h-32 bg-blue-100 rounded-md">
                              <Video className="h-10 w-10 text-blue-500" />
                              <span className="ml-2 text-blue-700 font-medium">
                                Video uploaded to S3
                              </span>
                            </div>
                          )}

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                            onClick={removeVideo}>
                            <X className="h-4 w-4" />
                          </Button>

                          {videoFile && (
                            <p className="text-sm text-blue-600 mt-2 font-medium">
                              {videoFile.name}
                            </p>
                          )}

                          {videoUrl && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Uploaded to S3
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={uploadingVideo}
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    {uploadingVideo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Uploading...
                      </>
                    ) : (
                      "Save Video"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorCourseCreation;

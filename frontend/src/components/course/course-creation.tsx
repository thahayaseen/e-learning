"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Save, Clock, RotateCcw, Trash } from "lucide-react";
import { toast } from "sonner";
import { addCourse } from "@/services/fetchdata";

import CourseBasicDetails from "./course-basic-details";
import CourseContent from "./course-content";
import CourseLessons from "./course-lessons";
import useUploadS3 from "@/hooks/addtis3";
import { useFormDraft } from "@/hooks/useFormDraft";
import { DialogTitle } from "@radix-ui/react-dialog";

interface CourseCreationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setCourses?: (courses: any) => void;
  initialData?: any; // Add this line
}

// Define the course data type
interface CourseData {
  Title: string;
  Description: string;
  Price: number;
  Category: string;
  Content: string;
  lessons: any[];
  image: string;
}

const CourseCreation = ({
  open,
  onOpenChange,
  setCourses,
  initialData,
}: CourseCreationProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const { uploading, uploadtos3 } = useUploadS3();

  const [courseData, setCourseData] = useState<CourseData>({
    Title: "",
    Description: "",
    Price: 0,
    Category: "",
    Content: "",
    lessons: [],
    image: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const [draftToLoad, setDraftToLoad] = useState(null);

  // Initialize the form draft hook
  const { hasDraft, formattedTimestamp, saveDraft, loadDraft, clearDraft } =
    useFormDraft<{
      courseData: CourseData;
      imagePreview: string;
    }>({
      draftKey: "course_creation_draft",
      expiryDays: 7,
      onLoad: (data) => {
        if (data) {
          setCourseData(data.courseData);
          setImagePreview(data.imagePreview || "");
        }
      },
    });

  // Check for draft when component mounts or when dialog opens
  useEffect(() => {
    console.log(open, "open is ", hasDraft);

    if (open && hasDraft) {
      setDraftDialogOpen(true);
    }
  }, [open, hasDraft]);

  // Auto-save draft when courseData changes
  useEffect(() => {
    if (
      open &&
      (courseData.Title ||
        courseData.Description ||
        courseData.lessons.length > 0)
    ) {
      const draftData = {
        courseData,
        imagePreview,
      };
      saveDraft(draftData);
    }
  }, [courseData, imagePreview, open]);

  // Update course data from child components
  const updateCourseData = (data: Partial<CourseData>) => {
    setCourseData((prev) => ({ ...prev, ...data }));
  };

  // Handle image file selection
  const handleImageChange = (file: File | null, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  // Load draft data
  const handleLoadDraft = () => {
    loadDraft();
    setDraftDialogOpen(false);
    toast.success("Draft loaded", {
      description: "Your previous work has been restored.",
    });
  };

  // Discard draft and start fresh
  const handleDiscardDraft = () => {
    clearDraft();
    setDraftDialogOpen(false);
    // Reset form to initial state
    setCourseData({
      Title: "",
      Description: "",
      Price: 0,
      Category: "",
      Content: "",
      lessons: [],
      image: "",
    });
    setImagePreview("");
    setImageFile(null);
    toast.info("Draft discarded", {
      description: "Starting with a fresh form.",
    });
  };

  const saveCourse = async () => {
    try {
      // Validate required fields
      if (
        !courseData.Title ||
        !courseData.Description ||
        !courseData.Category
      ) {
        toast.error("Validation Error", {
          description:
            "Please fill in all required fields in the Basic Details tab",
        });
        setActiveTab("basic");
        return;
      }

      // Check if there's at least one lesson
      if (courseData.lessons.length === 0) {
        toast.error("Validation Error", {
          description: "You must add at least one lesson",
        });
        setActiveTab("lessons");
        return;
      }

      // Upload image if needed
      let finalImageUrl = courseData.image;
      if (imageFile && !courseData.image) {
        finalImageUrl = await uploadtos3(imageFile, "image");
        if (!finalImageUrl) {
          toast.error("Upload Error", {
            description: "Failed to upload course image",
          });
          return;
        }
      }

      // Prepare final data
      const finalCourseData = {
        ...courseData,
        image: finalImageUrl,
      };

      // Send data to API
      const result = await addCourse(finalCourseData);
      console.log(result,'resust is ');

      if (result.success) {
        // Clear the draft after successful submission
        console.log('eiadfasdf');
        
        clearDraft();

        toast.success("Success", {
          description: "Course saved successfully!",
        });
        setCourseData({
          Title: "",
          Description: "",
          Price: 0,
          Category: "",
          Content: "",
          lessons: [],
          image: "",
        });
        setActiveTab('basic')
        setImageFile(null)
        setImagePreview("");
        // Update courses list if setCourses function is provided
        if (setCourses && result.results) {
          setCourses((prev: any) => [...prev, result.results]);
        }

        onOpenChange(false); // Close dialog
      } else {
        toast.error("Error", {
          description: result.message || "Failed to save course",
        });
      }
    } catch (error:any) {
      console.error("Error saving course:", error);
      toast.error(error.message||"Error", {
        description: "Failed to save course. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (initialData && open) {
      setCourseData(initialData.courseData);
      setImagePreview(initialData.imagePreview || "");
      // Clear the initialData after loading it
      setDraftToLoad(null);
    }
  }, [initialData, open]);

  return (
    <>
      {/* Draft Recovery Dialog */}
      <AlertDialog open={draftDialogOpen} onOpenChange={setDraftDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume your draft?</AlertDialogTitle>
            <AlertDialogDescription>
              We found a saved draft from {formattedTimestamp}. Would you like
              to continue where you left off?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              <Trash className="mr-2 h-4 w-4" /> Discard Draft
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLoadDraft}
              className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="mr-2 h-4 w-4" /> Resume Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Course Creation Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll p-0">
          <Card className="border-0 shadow-none h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl font-bold text-blue-800">
                  Create New Course
                </DialogTitle>
                {hasDraft && (
                  <div className="flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    <Clock className="h-3 w-3 mr-1" /> Auto-saving draft
                  </div>
                )}
              </div>
              <CardDescription className="text-blue-600">
                Fill out the details to create a new course. Add lessons and
                tasks to structure your content.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 bg-blue-50 rounded-none">
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

                <div className="flex-1 overflow-auto">
                  <TabsContent value="basic" className="h-full p-6 m-0">
                    <CourseBasicDetails
                      courseData={courseData}
                      updateCourseData={updateCourseData}
                      imageFile={imageFile}
                      imagePreview={imagePreview}
                      onImageChange={handleImageChange}
                      uploading={uploading}
                    />
                  </TabsContent>

                  <TabsContent value="content" className="h-full p-6 m-0">
                    <CourseContent
                      content={courseData.Content}
                      updateContent={(content) =>
                        updateCourseData({ Content: content })
                      }
                    />
                  </TabsContent>

                  <TabsContent value="lessons" className="h-full p-6 m-0">
                    <CourseLessons
                      lessons={courseData.lessons}
                      updateLessons={(lessons) => updateCourseData({ lessons })}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between bg-gray-50 border-t">
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50">
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your progress is saved as a draft, but if you leave now,
                        you'll need to resume later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-blue-200 text-blue-700">
                        Continue Editing
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => onOpenChange(false)}>
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {hasDraft && (
                  <Button
                    variant="outline"
                    onClick={clearDraft}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    <Trash className="mr-2 h-4 w-4" /> Clear Draft
                  </Button>
                )}
              </div>

              <Button
                onClick={saveCourse}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Course
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseCreation;

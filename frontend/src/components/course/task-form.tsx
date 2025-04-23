"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Upload, Video, X } from "lucide-react";
import useUploadS3 from "@/hooks/addtos3";

import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define validation schemas
const quizFormSchema = z.object({
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

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskType: string;
  taskData: any | null;
  onSave: (data: any) => void;
}

const TaskForm = ({
  open,
  onOpenChange,
  taskType,
  taskData,
  onSave,
}: TaskFormProps) => {
  const { uploading, uploadingVideo, uploadtos3 } = useUploadS3();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Quiz form setup
  const quizForm = useForm({
    resolver: zodResolver(quizFormSchema),
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

  // Update forms when taskData changes
  useEffect(() => {
    if (taskData) {
      const type = taskType.toLowerCase();

      if (type === "quiz") {
        quizForm.reset({
          Question: taskData.Question || "",
          Options: taskData.Options || ["", "", "", ""],
          Answer: taskData.Answer || "",
        });
      } else if (type === "assignment") {
        assignmentForm.reset({
          Description: taskData.Description || "",
        });
      } else if (type === "video") {
        videoForm.reset({
          VideoFile: null,
        });

        if (taskData.VideoURL) {
          setVideoUrl(taskData.VideoURL);
        }
      }
    } else {
      // Reset forms when adding new task
      const type = taskType.toLowerCase();

      if (type === "quiz") {
        quizForm.reset({
          Question: "",
          Options: ["", "", "", ""],
          Answer: "",
        });
      } else if (type === "assignment") {
        assignmentForm.reset({
          Description: "",
        });
      } else if (type === "video") {
        videoForm.reset({
          VideoFile: null,
        });
        setVideoFile(null);
        setVideoPreview("");
        setVideoUrl(null);
      }
    }
  }, [taskData, taskType, quizForm, assignmentForm, videoForm, open]);

  // Handle video upload
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setVideoFile(file);
      videoForm.setValue("VideoFile", file);

      // Create a preview URL if it's a video file
      if (file.type.startsWith("video/")) {
        const videoPreviewUrl = URL.createObjectURL(file);
        setVideoPreview(videoPreviewUrl);
      }
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

  // Handle form submissions
  const onQuizSubmit = (data: z.infer<typeof quizFormSchema>) => {
    onSave({
      Type: "Quiz",
      ...data,
    });
  };

  const onAssignmentSubmit = (data: z.infer<typeof assignmentFormSchema>) => {
    onSave({
      Type: "Assignment",
      ...data,
    });
  };

  const onVideoSubmit = async (data: any) => {
    try {
      let finalVideoUrl = videoUrl;

      if (videoFile && !videoUrl) {
        finalVideoUrl = await uploadtos3(videoFile, "video");
        setVideoUrl((prev) => (finalVideoUrl ? finalVideoUrl : prev));
      }

      onSave({
        Type: "Video",
        VideoURL: finalVideoUrl || "",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-blue-800">
            {taskData ? `Edit ${taskType}` : `Add New ${taskType}`}
          </DialogTitle>
        </DialogHeader>

        {taskType.toLowerCase() === "quiz" && (
          <Form {...quizForm}>
            <form
              onSubmit={quizForm.handleSubmit(onQuizSubmit)}
              className="space-y-4 py-4">
              <FormField
                control={quizForm.control}
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
                control={quizForm.control}
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
                control={quizForm.control}
                name="Answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700">
                      Correct Answer
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500 hover:border-blue-400">
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {quizForm
                            .watch("Options")
                            .filter((option) => option.trim() !== "")
                            .map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="text-blue-600">
                      Select the correct answer from the options
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

        {taskType.toLowerCase() === "assignment" && (
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

        {taskType.toLowerCase() === "video" && (
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
  );
};

export default TaskForm;

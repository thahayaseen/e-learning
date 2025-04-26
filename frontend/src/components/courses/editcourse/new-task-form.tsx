"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Upload, Video } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuizOption from "./quiz-option";
import TaskTypeSelector from "./task-type-selector";
import useS3bucket from "@/hooks/addtos3";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface NewTaskFormProps {
  newTask: {
    Type: "Quiz" | "Assignment" | "Video";
    content: string;
    options?: string[];
    answer?: string;
    videoURL?: string;
  };
  setNewTask: React.Dispatch<
    React.SetStateAction<{
      Type: "Quiz" | "Assignment" | "Video";
      content: string;
      options?: string[];
      answer?: string;
      videoURL?: string;
    }>
  >;
  onAddTask: () => void;
}

const NewTaskForm = ({ newTask, setNewTask, onAddTask }: NewTaskFormProps) => {
  const { uploadingVideo, uploadtos3 } = useS3bucket();
  const [videoURL, setVideoURL] = useState("");

  // Initialize options array when type changes to Quiz
  useEffect(() => {
    if (
      newTask.Type === "Quiz" &&
      (!newTask.options || newTask.options.length === 0)
    ) {
      setNewTask({
        ...newTask,
        options: ["", "", "", ""], // Initialize with 4 empty options
        answer: "",
      });
    }
  }, [newTask.Type]);

  const handleNewTaskChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
    optionIndex?: number
  ) => {
    if (field === "option" && optionIndex !== undefined) {
      const newOptions = [...(newTask.options || [])];
      newOptions[optionIndex] = e.target.value;
      setNewTask({
        ...newTask,
        options: newOptions,
      });
    } else {
      setNewTask({
        ...newTask,
        [field]: e.target.value,
      });
    }
  };

  const handleTypeChange = (value: "Quiz" | "Assignment" | "Video") => {
    // Reset specific fields when changing type
    if (value === "Quiz") {
      setNewTask({
        Type: value,
        content: newTask.content,
        options: ["", "", "", ""],
        answer: "",
      });
    } else if (value === "Video") {
      setNewTask({
        Type: value,
        content: newTask.content,
        videoURL: videoURL || newTask.videoURL,
      });
    } else {
      setNewTask({
        Type: value,
        content: newTask.content,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    try {
      // Upload to S3 and get the URL
      const uploadedURL = await uploadtos3(file, "video");

      // Update both local state and parent component state
      setVideoURL(uploadedURL);

      // Update the newTask state with the video URL
      setNewTask({
        ...newTask,
        videoURL: uploadedURL,
      });

      toast.success("Video uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload video");
      console.error(error);
    }
  };

  const handleAddTask = () => {
    // Basic validation
    if (newTask.Type === "Quiz") {
      if (!newTask.content) {
        toast.error("Please enter a quiz question");
        return;
      }
      if (!newTask.options || newTask.options.some((opt) => !opt)) {
        toast.error("Please fill in all options");
        return;
      }
      if (!newTask.answer) {
        toast.error("Please select a correct answer");
        return;
      }
    } else if (newTask.Type === "Assignment") {
      if (!newTask.content) {
        toast.error("Please enter assignment description");
        return;
      }
    } else if (newTask.Type === "Video") {
      if (!newTask.videoURL && !videoURL) {
        toast.error("Please provide a video URL or upload a video");
        return;
      }
    }

    onAddTask();
  };

  return (
    <div className="bg-blue-900 border border-blue-800 rounded-md p-4">
      <h3 className="text-lg font-medium text-blue-100 mb-4">Add New Task</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-blue-200">Task Type</Label>
          <TaskTypeSelector
            selectedType={newTask.Type}
            onChange={handleTypeChange}
          />
        </div>

        {newTask.Type === "Quiz" && (
          <>
            <div className="space-y-2">
              <Label className="text-blue-200">Question</Label>
              <Input
                value={newTask.content || ""}
                onChange={(e) => handleNewTaskChange(e, "content")}
                placeholder="Enter quiz question"
                className="bg-blue-800 border-blue-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">Options</Label>
              <div className="grid grid-cols-1 gap-2">
                {(newTask.options || []).map((option, optionIndex) => (
                  <QuizOption
                    key={optionIndex}
                    option={option}
                    optionIndex={optionIndex}
                    isCorrectAnswer={newTask.answer === option}
                    isDisabled={false}
                    onChange={(e) =>
                      handleNewTaskChange(e, "option", optionIndex)
                    }
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">Correct Answer</Label>
              <Select
                value={newTask.answer || ""}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, answer: value })
                }>
                <SelectTrigger className="bg-blue-800 border-blue-700 text-white">
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {(newTask.options || [])
                    .filter((option) => option.trim() !== "")
                    .map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {newTask.Type === "Assignment" && (
          <div className="space-y-2">
            <Label className="text-blue-200">Assignment Description</Label>
            <Textarea
              value={newTask.content || ""}
              onChange={(e) => handleNewTaskChange(e, "content")}
              placeholder="Enter assignment instructions"
              className="bg-blue-800 border-blue-700 text-white"
              rows={4}
            />
          </div>
        )}

        {newTask.Type === "Video" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Video size={18} className="mr-2" />
              Add Video Content
            </h3>

            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-white">
                Video URL <span className="text-red-400">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="videoUrl"
                  value={newTask.videoURL || videoURL || ""}
                  onChange={(e) => {
                    setVideoURL(e.target.value);
                    setNewTask({
                      ...newTask,
                      videoURL: e.target.value,
                    });
                  }}
                  placeholder="Enter S3 video URL or upload a video"
                  className="bg-blue-700 border-blue-600 text-white max-w-[500px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Upload Video to S3</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-blue-700 border-blue-600 text-white relative overflow-hidden"
                    disabled={uploadingVideo}>
                    <Upload size={16} className="mr-2" />
                    <span>Select Video File</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={uploadingVideo}
                    />
                  </Button>
                </div>

                {(newTask.videoURL || videoURL) && (
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <Check size={16} className="text-green-400" />
                    Video ready: {(newTask.videoURL || videoURL).slice(0, 30)}
                    ...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          type="button"
          disabled={uploadingVideo}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          onClick={handleAddTask}>
          <Plus size={16} className="mr-2" />
          Add{" "}
          {newTask.Type === "Quiz"
            ? "Quiz"
            : newTask.Type === "Assignment"
            ? "Assignment"
            : "Video"}
        </Button>
      </div>
    </div>
  );
};

export default NewTaskForm;

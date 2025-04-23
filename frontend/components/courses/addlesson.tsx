"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { BookOpen, Plus, Video, FileText, HelpCircle, Trash2, Upload, Check, X } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import type { ICourses, ILesson, ITask, IQuizTask, IAssignmentTask, IVideoTask } from "@/services/interface/CourseDto";

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: ICourses | null;
  onSave: (newLesson: Omit<ILesson, "_id">, tasks: (IQuizTask | IAssignmentTask | IVideoTask)[]) => Promise<void>;
}

const AddLessonModal = ({
  isOpen,
  onClose,
  course,
  onSave,
}: AddLessonModalProps) => {
  const [newLesson, setNewLesson] = useState<Omit<ILesson, "_id">>({
    Lessone_name: "",
    Content: "",
    Task: [],
  });
  
  const [tasks, setTasks] = useState<(IQuizTask | IAssignmentTask | IVideoTask)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [taskType, setTaskType] = useState<"quiz" | "assignment" | "video">("assignment");
  
  // Quiz task state
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizAnswer, setQuizAnswer] = useState("");
  
  // Assignment task state
  const [assignmentDescription, setAssignmentDescription] = useState("");
  
  // Video task state
  const [videoURL, setVideoURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewLesson({
      ...newLesson,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuizOptionChange = (index: number, value: string) => {
    const newOptions = [...quizOptions];
    newOptions[index] = value;
    setQuizOptions(newOptions);
  };

  const handleAddTask = () => {
    // Create a temporary ID for the task
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (taskType === "quiz") {
      if (!quizQuestion || quizOptions.some(opt => !opt) || !quizAnswer) return;
      
      const quizTask: IQuizTask = {
        Type: "Quiz",
        Lesson_id: tempId, // This will be replaced with the actual lesson ID when saved
        Question: quizQuestion,
        Options: [...quizOptions],
        Answer: quizAnswer
      };
      
      setTasks([...tasks, quizTask]);
      setQuizQuestion("");
      setQuizOptions(["", "", "", ""]);
      setQuizAnswer("");
    } 
    else if (taskType === "assignment") {
      if (!assignmentDescription) return;
      
      const assignmentTask: IAssignmentTask = {
        Type: "Assignment",
        Lesson_id: tempId,
        Description: assignmentDescription
      };
      
      setTasks([...tasks, assignmentTask]);
      setAssignmentDescription("");
    } 
    else if (taskType === "video") {
      if (!videoURL) return;
      
      const videoTask: IVideoTask = {
        Type: "Video",
        Lesson_id: tempId,
        VideoURL: videoURL
      };
      
      setTasks([...tasks, videoTask]);
      setVideoURL("");
    }
  };

  const handleRemoveTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const simulateS3Upload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 20);
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Simulate S3 URL generation
          const fakeS3Url = `https://your-bucket.s3.amazonaws.com/videos/${file.name.replace(/\s+/g, '-')}`;
          setVideoURL(fakeS3Url);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }
    
    // Simulate S3 upload
    simulateS3Upload(file);
  };

  const handleSave = async () => {
    if (!newLesson.Lessone_name) return;

    setIsLoading(true);
    try {
      // Create task IDs array for the lesson
      const taskIds = tasks.map(task => task.Lesson_id);
      
      // Update the lesson with task IDs
      const lessonToSave = {
        ...newLesson,
        Task: tasks
      };
      
      await onSave(lessonToSave, tasks);

      // Reset form
      setNewLesson({
        Lessone_name: "",
        Content: "",
        Task: [],
      });
      setTasks([]);
      setActiveTab("details");

      onClose();
    } catch (error) {
      console.error("Error saving lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl h-[90vh] bg-blue-900 text-white overflow-y-scroll border-blue-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <BookOpen size={18} />
            Add New Lesson
            {course && (
              <Badge className="ml-2 bg-blue-700 text-xs">
                {course.Title}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Create a new lesson with content and tasks for your course
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-800 border-none">
            <TabsTrigger
              value="details"
              className="text-blue-300 data-[state=active]:bg-blue-700 data-[state=active]:text-white">
              Lesson Details
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="text-blue-300 data-[state=active]:bg-blue-700 data-[state=active]:text-white">
              Tasks & Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Lessone_name" className="text-white">
                Lesson Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="Lessone_name"
                name="Lessone_name"
                value={newLesson.Lessone_name || ""}
                onChange={handleInputChange}
                placeholder="Enter lesson name"
                className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Content" className="text-white">
                Lesson Content
              </Label>
              <Textarea
                id="Content"
                name="Content"
                value={newLesson.Content || ""}
                onChange={handleInputChange}
                placeholder="Enter lesson content, instructions, or description"
                rows={10}
                className="bg-blue-800 border-blue-700 text-white focus:border-blue-500"
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-6">
            {/* Task Type Selector */}
            <div className="space-y-3">
              <Label className="text-white">Task Type</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={taskType === "quiz" ? "default" : "outline"}
                  className={taskType === "quiz" 
                    ? "bg-blue-600" 
                    : "bg-blue-800 border-blue-700 text-blue-200"}
                  onClick={() => setTaskType("quiz")}
                >
                  <HelpCircle size={16} className="mr-2" />
                  Quiz Question
                </Button>
                <Button
                  type="button"
                  variant={taskType === "assignment" ? "default" : "outline"}
                  className={taskType === "assignment" 
                    ? "bg-blue-600" 
                    : "bg-blue-800 border-blue-700 text-blue-200"}
                  onClick={() => setTaskType("assignment")}
                >
                  <FileText size={16} className="mr-2" />
                  Assignment
                </Button>
                <Button
                  type="button"
                  variant={taskType === "video" ? "default" : "outline"}
                  className={taskType === "video" 
                    ? "bg-blue-600" 
                    : "bg-blue-800 border-blue-700 text-blue-200"}
                  onClick={() => setTaskType("video")}
                >
                  <Video size={16} className="mr-2" />
                  Video
                </Button>
              </div>
            </div>

            <Separator className="bg-blue-700" />

            {/* Task Form Based on Type */}
            <div className="bg-blue-800 p-4 rounded-md">
              {taskType === "quiz" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <HelpCircle size={18} className="mr-2" />
                    Add Quiz Question
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="question" className="text-white">
                      Question <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="question"
                      value={quizQuestion}
                      onChange={(e) => setQuizQuestion(e.target.value)}
                      placeholder="Enter your question"
                      className="bg-blue-700 border-blue-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">
                      Options <span className="text-red-400">*</span>
                    </Label>
                    <div className="space-y-2">
                      {quizOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-sm">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <Input
                            value={option}
                            onChange={(e) => handleQuizOptionChange(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="bg-blue-700 border-blue-600 text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="answer" className="text-white">
                      Correct Answer <span className="text-red-400">*</span>
                    </Label>
                    <Select value={quizAnswer} onValueChange={setQuizAnswer}>
                      <SelectTrigger className="bg-blue-700 border-blue-600 text-white">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-700 border-blue-600 text-white">
                        {quizOptions.map((option, index) => (
                          <SelectItem 
                            key={index} 
                            value={option || `Option ${String.fromCharCode(65 + index)}`}
                            disabled={!option}
                          >
                            {option || `Option ${String.fromCharCode(65 + index)} (empty)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {taskType === "assignment" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <FileText size={18} className="mr-2" />
                    Add Assignment
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Assignment Description <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={assignmentDescription}
                      onChange={(e) => setAssignmentDescription(e.target.value)}
                      placeholder="Enter detailed instructions for the assignment"
                      rows={6}
                      className="bg-blue-700 border-blue-600 text-white"
                    />
                  </div>
                </div>
              )}

              {taskType === "video" && (
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
                        value={videoURL}
                        onChange={(e) => setVideoURL(e.target.value)}
                        placeholder="Enter S3 video URL or upload a video"
                        className="bg-blue-700 border-blue-600 text-white"
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
                          disabled={isUploading}
                        >
                          <Upload size={16} className="mr-2" />
                          <span>Select Video File</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </Button>
                        {isUploading && (
                          <span className="text-blue-300 text-sm">
                            Uploading: {uploadProgress}%
                          </span>
                        )}
                      </div>
                      
                      {isUploading && (
                        <div className="w-full bg-blue-950 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {videoURL && (
                        <div className="flex items-center gap-2 text-sm text-blue-300">
                          <Check size={16} className="text-green-400" />
                          Video ready: {videoURL.split('/').pop()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-500"
                  onClick={handleAddTask}
                  disabled={
                    (taskType === "quiz" && (!quizQuestion || quizOptions.some(opt => !opt) || !quizAnswer)) ||
                    (taskType === "assignment" && !assignmentDescription) ||
                    (taskType === "video" && !videoURL) ||
                    isUploading
                  }
                >
                  <Plus size={16} className="mr-2" />
                  Add {taskType === "quiz" ? "Quiz Question" : taskType === "assignment" ? "Assignment" : "Video"}
                </Button>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Added Tasks</h3>
              
              {tasks.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {tasks.map((task, index) => (
                    <Card key={index} className="bg-blue-800 border-blue-700">
                      <CardHeader className="py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                          {task.Type === "Quiz" && (
                            <>
                              <HelpCircle size={16} />
                              Quiz Question
                            </>
                          )}
                          {task.Type === "Assignment" && (
                            <>
                              <FileText size={16} />
                              Assignment
                            </>
                          )}
                          {task.Type === "Video" && (
                            <>
                              <Video size={16} />
                              Video
                            </>
                          )}
                          <Badge className="ml-2 bg-blue-700 text-xs">
                            {index + 1}
                          </Badge>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-300 hover:text-red-300 hover:bg-blue-700"
                          onClick={() => handleRemoveTask(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardHeader>
                      <CardContent className="py-2">
                        {task.Type === "Quiz" && (
                          <div className="text-sm text-blue-200">
                            <p className="font-medium">{(task as IQuizTask).Question}</p>
                            <div className="mt-1 pl-2 border-l-2 border-blue-700">
                              {(task as IQuizTask).Options.map((option, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className="text-xs">{String.fromCharCode(65 + i)}:</span>
                                  <span className={option === (task as IQuizTask).Answer ? "text-green-400" : ""}>
                                    {option}
                                    {option === (task as IQuizTask).Answer && " ✓"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {task.Type === "Assignment" && (
                          <p className="text-sm text-blue-200 line-clamp-2">
                            {(task as IAssignmentTask).Description}
                          </p>
                        )}
                        {task.Type === "Video" && (
                          <div className="text-sm text-blue-200 flex items-center gap-2">
                            <Video size={14} />
                            <span className="truncate max-w-[250px]">
                              {(task as IVideoTask).VideoURL.split('/').pop()}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-blue-400 bg-blue-800/50 rounded-md">
                  No tasks added yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
            onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={handleSave}
            disabled={isLoading || !newLesson.Lessone_name}>
            {isLoading ? "Creating..." : "Create Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLessonModal;

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  BookOpen,
  Edit,
  Trash2,
  X,
  Plus,
  CheckCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getImage } from "@/services/getImage";
import type { ICourses } from "@/services/interface/CourseDto";

// Interfaces matching your schema
interface ITask {
  _id: string;
  Type: "Quiz" | "Assignment" | "Video";
  Question?: string;
  Options?: string[];
  Answer?: string;
  Description?: string;
  VideoURL?: string;
}

interface ILesson {
  _id: string;
  Lessone_name: string;
  Content: string;
  Task: ITask[];
}

interface AdminCourseLessonTaskViewProps {
  selectedcourse: ICourses;
  onClose: () => void;
}

const AdminCourseLessonTaskView: React.FC<AdminCourseLessonTaskViewProps> = ({
  selectedcourse,
  onClose,
}) => {
  const [expandedLessons, setExpandedLessons] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Fetch lessons data when component mounts
  useEffect(() => {
    // This would be replaced with your actual API call
    // For now, we'll simulate with the data structure you provided
    if (
      selectedcourse &&
      selectedcourse.lessons &&
      selectedcourse.lessons.length > 0
    ) {
      // Assuming the first lesson is selected by default
      const firstLesson = selectedcourse.lessons[0] as unknown as ILesson;
      setSelectedLesson(firstLesson);
      if (firstLesson.Task && firstLesson.Task.length > 0) {
        setSelectedTask(firstLesson.Task[0]);
      }
    }
  }, [selectedcourse]);

  const toggleLessonExpand = (lessonId: string) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "Quiz":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "Assignment":
        return <Edit className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTaskStatusBadge = (type: string) => {
    switch (type) {
      case "Quiz":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200">
            Quiz
          </Badge>
        );
      case "Video":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200">
            Video
          </Badge>
        );
      case "Assignment":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200">
            Assignment
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const RenderTaskContent = ({ task }: { task: ITask }) => {
    if (!task) return <p className="text-muted-foreground">No task selected</p>;

    switch (task.Type) {
      case "Quiz":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-lg mb-3 text-green-800">
                Quiz Question
              </h3>
              <p className="text-gray-800 font-medium mb-4">{task.Question}</p>

              <div className="space-y-3">
                {task.Options?.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-3 rounded-md border ${
                      option === task.Answer
                        ? "bg-green-100 border-green-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}>
                    {option === task.Answer && (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    )}
                    <span
                      className={option === task.Answer ? "font-medium" : ""}>
                      {option}
                    </span>
                    {option === task.Answer && (
                      <Badge className="ml-auto bg-green-600">
                        Correct Answer
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Assignment":
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="font-medium text-lg mb-3 text-purple-800">
                Assignment
              </h3>
              <p className="text-gray-800">{task.Description}</p>
            </div>
          </div>
        );

      case "Video":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-lg mb-3 text-blue-800">
                Video Lesson
              </h3>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {task.VideoURL ? (
                  <video
                    src={getImage(task.VideoURL)}
                    title="Task Video"
                    className="w-full h-full"
                    controls
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    Video URL not available
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Unsupported task type</p>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-full h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {selectedcourse.Title}
            </DialogTitle>
          
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {selectedcourse.Category?.name || "Uncategorized"}
            </Badge>
            <Badge
              variant={
                selectedcourse.Approved_by_admin === "approved"
                  ? "success"
                  : selectedcourse.Approved_by_admin === "rejected"
                  ? "destructive"
                  : "outline"
              }
              className="text-xs">
              {selectedcourse.Approved_by_admin}
            </Badge>
            {selectedcourse.unlist && (
              <Badge
                variant="outline"
                className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                Unlisted
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          className="h-full"
          onValueChange={setActiveTab}>
          <div className="border-b px-6">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-background">
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-background">
                Content
              </TabsTrigger>
           
            </TabsList>
          </div>

          <div className="h-[calc(80vh-10rem)] overflow-hidden">
            <TabsContent value="overview" className="h-full m-0 p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                <div className="border-r p-6">
                  <h3 className="font-medium text-lg mb-4">Course Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p>
                        {selectedcourse.Description ||
                          "No description available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p>${selectedcourse.Price || 0}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created By
                      </p>
                      <p>
                        {selectedcourse.Mentor_id?.name ||
                          selectedcourse.username ||
                          "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created At
                      </p>
                      <p>
                        {new Date(
                          selectedcourse.CreatedAt || ""
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Students Enrolled
                      </p>
                      <p>
                        {selectedcourse.Students_enrolled?.length || 0} students
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">Course Image</h3>
                  </div>

                  {selectedcourse.image ? (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={
                          getImage(selectedcourse.image) || "/placeholder.svg"
                        }
                        alt={selectedcourse.Title || "Course"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">
                        No image available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="h-full m-0 p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                <div className="border-r">
                

                  <ScrollArea className="h-[calc(80vh-14rem)] ">
                    <div className="p-2">
                      {(selectedcourse.lessons as unknown as ILesson[])?.map(
                        (lesson) => (
                          <div
                            key={lesson._id}
                            className={`mb-2 rounded-md w-[17vw] border border-primary-foreground${
                              selectedLesson?._id === lesson._id
                                ? "border-primary bg-primary-foreground/5"
                                : ""
                            }`}>
                            <div
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                              onClick={() => {
                                setSelectedLesson(lesson);
                                if (lesson.Task && lesson.Task.length > 0) {
                                  setSelectedTask(lesson.Task[0]);
                                }
                                toggleLessonExpand(lesson._id);
                              }}>
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                                <span className="font-medium truncate max-w-[150px]">
                                  {lesson.Lessone_name}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  {lesson.Task?.length || 0} tasks
                                </Badge>
                                {expandedLessons[lesson._id] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </div>

                            {expandedLessons[lesson._id] && (
                              <div className="bg-muted/30 p-2">
                                {lesson.Task?.map((task) => (
                                  <div
                                    key={task._id}
                                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                                      selectedTask?._id === task._id
                                        ? "bg-primary-foreground/10"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() => setSelectedTask(task)}>
                                    {getTaskIcon(task.Type)}
                                    <span className="ml-2 truncate">
                                      {task.Question ||
                                        task.Description ||
                                        "Task"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="col-span-2 p-6 overflow-y-scroll h-[60vh]">
                  {selectedLesson ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-medium mb-2">
                          {selectedLesson.Lessone_name}
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Lesson Content</h4>
                          <p>
                            {selectedLesson.Content || "No content available"}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                 

                        {selectedTask ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                {getTaskIcon(selectedTask.Type)}
                                <span className="ml-2 font-medium">
                                  {selectedTask.Question ||
                                    selectedTask.Description ||
                                    "Task"}
                                </span>
                              </div>
                              {getTaskStatusBadge(selectedTask.Type)}
                            </div>

                            <RenderTaskContent task={selectedTask} />
                          </div>
                        ) : (
                          <div className="text-center p-8 bg-muted/20 rounded-lg">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                              Select a task to view details
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          Select a lesson to view details
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCourseLessonTaskView;

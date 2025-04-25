import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  BookOpen,
  Edit,
  Trash2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { getImage } from "@/services/getImage";

// Interfaces matching your previous schema
interface ITask {
  _id: string;
  Type: "Quiz" | "Assignment" | "Video";
  title: string;
  content?: string;
}

interface ILesson {
  _id: string;
  Lessone_name: string;
  Task: ITask[];
}

interface ICourse {
  _id: string;
  Title: string;
  lessons: ILesson[];
}

// Dummy Data
const dummyCourses: ICourse[] = [
  {
    _id: "course_001",
    Title: "Advanced Web Development",
    lessons: [
      {
        _id: "lesson_001",
        Lessone_name: "JavaScript Fundamentals",
        tasks: [
          {
            _id: "task_001",
            Type: "video",
            title: "Introduction to JavaScript",
            content: "https://example.com/js-intro.mp4",
          },
          {
            _id: "task_002",
            Type: "quiz",
            title: "JavaScript Basics Quiz",
          },
        ],
      },
      {
        _id: "lesson_002",
        Lessone_name: "React Components",
        tasks: [
          {
            _id: "task_003",
            Type: "video",
            title: "Understanding React Components",
            content: "https://example.com/react-components.mp4",
          },
          {
            _id: "task_004",
            Type: "assignment",
            title: "Create a Simple React Component",
          },
        ],
      },
    ],
  },
];

const AdminCourseLessonTaskView = ({
  selectedcourse,
}: {
  selectedcourse: ICourse;
}) => {
  const [expandedCourses, setExpandedCourses] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };
   const getTaskIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="text-blue-500 mr-2" />;
      case "Quiz":
        return <FileText className="text-green-500 mr-2" />;
      case "Assignment":
        return <Edit className="text-purple-500 mr-2" />;
      default:
        return null;
    }
  };
  const RenderTaskContent = ({ task }) => {
     if (!task) return <p>No task selected</p>;
    switch (task.Type) {
      case "Quiz":
        const quizTask = task;
        return (
          <div className="space-y-4">
            <p className="font-semibold">{quizTask.Question}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quizTask.Options.map((option, index) => (
                <Button key={index} className="w-full">
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case "Assignment":
        const assignmentTask = task;
        return (
          <div className="space-y-4">
            <p className="font-semibold">{assignmentTask.Description}</p>
          </div>
        );

      case "Video":
        const videoTask = task;
        return (
          <div className="space-y-4">
            <div className="aspect-video">
              <video
                src={getImage(videoTask.VideoURL)}
                title="Task Video"
                className="w-full h-full rounded"
                controls
              />
            </div>
          </div>
        );

      default:
        return <p>Unsupported task type</p>;
    }
  };
  const TaskDetailDialog = () => {
    if (!selectedTask) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">View Details</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask.title}</DialogTitle>
            <DialogDescription>
              Details for the {selectedTask.Type} task
            </DialogDescription>
          </DialogHeader>
          <RenderTaskContent task={selectedTask} />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Course Structure Overview
          <Button variant="outline">+ Add New Course</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Courses List */}
          <div className="space-y-4">
            <div key={selectedcourse._id} className="border rounded-lg">
              <div
                onClick={() => toggleCourseExpand(selectedcourse._id)}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100">
                <div className="flex items-center">
                  <BookOpen className="mr-2" />
                  <span className="font-semibold">{selectedcourse.Title}</span>
                </div>
                {expandedCourses[selectedcourse._id] ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </div>

              {expandedCourses[selectedcourse._id] && (
                <div className="p-4 bg-gray-50">
                  {selectedcourse.lessons.map((lesson) => (
                    <div key={lesson._id} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{lesson.Lessone_name}</h3>
                      </div>
                      <div className="space-y-2">
                        {lesson.Task.map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center justify-between p-2 bg-white border rounded hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedTask(task)}>
                            <div className="flex items-center">
                              {getTaskIcon(task.Type)}
                              <span>{task.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Task Details */}
          <div>
            {selectedTask ? (
              <Card>
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskDetailDialog />
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-full">
                <CardContent className="text-center">
                  <BookOpen className="mx-auto mb-4 w-16 h-16 text-gray-300" />
                  <p className="text-muted-foreground">
                    Select a task to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCourseLessonTaskView;

"use client";
import React, { useState, useEffect } from "react";

import {
  Play,
  MessageCircle,
  Send,
  CheckCircle2,
  BookOpen,
  FileText,
  User,
  Calendar,
  Clock,
  Award,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSelectedCourse, startChat } from "@/services/fetchdata";
import { toast } from "@/hooks/use-toast";
import {  useRouter } from "next/navigation";

// Interfaces remain the same
interface Course {
  _id: string;
  Title: string;
  Mentor_id: { name: string };
  Description: string;
  lessons: Lesson[];
  Duration?: string;
  Level?: string;
  Category?: string;
  CreatedAt?: string;
}

interface Lesson {
  Lessone_name: string;
  Content: string;
  Task: Task[];
}

interface Task {
  _id: string;
  Type: string;
  content?: string;
  questions?: QuizQuestion[];
  description?: string;
  VideoURL?: string;
  Question?: string;
  Options?: any;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface TaskProgress {
  id: string;
  watchedDuration: number;
  totalDuration: number;
  isCompleted: boolean;
}

// Mock function for submitting quiz answers to backend
const submitQuizToBackend = async (taskId: string, answer: string) => {
  // This would be replaced with your actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a response from backend
      const isCorrect = Math.random() > 0.5; // Just for demo
      resolve({ success: true, isCorrect });
    }, 1000);
  });
};

const CourseView = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskProgress, setTaskProgress] = useState<{
    [key: string]: TaskProgress;
  }>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [assignmentSubmission, setAssignmentSubmission] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router=useRouter()
  // Calculate overall course progress
  const calculateProgress = () => {
    if (!course) return 0;

    const totalTasks = course.lessons.reduce(
      (total, lesson) => total + lesson.Task.length,
      0
    );

    const completedTasks = Object.values(taskProgress).filter(
      (task) => task.isCompleted
    ).length;

    return totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
  };

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const data = await getSelectedCourse(id);
        setCourse(data);

        // Initialize task progress
        const initialProgress: { [key: string]: TaskProgress } = {};
        data.lessons.forEach((lesson) => {
          lesson.Task.forEach((task) => {
            initialProgress[task._id] = {
              id: task._id,
              watchedDuration: 0,
              totalDuration: 0,
              isCompleted: false,
            };
          });
        });
        setTaskProgress(initialProgress);

        // Select first task by default
        if (data.lessons.length > 0 && data.lessons[0].Task.length > 0) {
          setSelectedTask(data.lessons[0].Task[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  // Video progress handler
  const handleVideoProgress = (
    taskId: string,
    event: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = event.currentTarget;
    const progress = taskProgress[taskId];

    // Update watched duration
    const updatedProgress = {
      ...progress,
      watchedDuration: Math.floor(video.currentTime),
      totalDuration: Math.floor(video.duration),
    };

    // Mark as completed if watched more than 90%
    if (video.currentTime / video.duration > 0.9) {
      updatedProgress.isCompleted = true;
    }

    setTaskProgress((prev) => ({
      ...prev,
      [taskId]: updatedProgress,
    }));
  };

  // Quiz answer handler
  const handleQuizAnswer = (
    taskId: string,
    questionIndex: number,
    answer: string
  ) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [`${taskId}_${questionIndex}`]: answer,
    }));
  };
  const handleChatmentor = async () => {
    if (course) {
    const roomid=await startChat(String(course._id));
    console.log(roomid);
    router.push('/course/chat/'+roomid)
    
    }
  };
  // Submit quiz - updated to use backend function
  const submitQuiz = async (taskId: string) => {
    if (!quizAnswers[`${taskId}_0`]) {
      toast({
        title: "Select an answer",
        description: "Please select an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Call your backend submission function here
      const result = await submitQuizToBackend(
        taskId,
        quizAnswers[`${taskId}_0`]
      );

      // @ts-ignore - Assuming result has an isCorrect property
      if (result.isCorrect) {
        // Mark as completed if correct
        setTaskProgress((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            isCompleted: true,
          },
        }));

        toast({
          title: "Quiz Passed!",
          description: "Great job! You've answered correctly.",
          variant: "default",
        });
      } else {
        toast({
          title: "Incorrect Answer",
          description: "Please try again with a different answer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your answer.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit assignment
  const submitAssignment = (taskId: string) => {
    if (assignmentSubmission.trim()) {
      setSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        // Mark assignment as completed
        setTaskProgress((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            isCompleted: true,
          },
        }));

        toast({
          title: "Assignment Submitted",
          description: "Your assignment has been submitted successfully!",
          variant: "default",
        });

        setAssignmentSubmission("");
        setSubmitting(false);
      }, 1000);
    } else {
      toast({
        title: "Empty Submission",
        description: "Please write your assignment solution before submitting",
        variant: "destructive",
      });
    }
  };

  // Render task content based on type
  const renderTaskContent = () => {
    if (!selectedTask) return null;

    switch (selectedTask.Type) {
      case "Video":
        const progress = taskProgress[selectedTask._id];
        const watchProgress = progress
          ? Math.floor(
              (progress.watchedDuration / (progress.totalDuration || 1)) * 100
            )
          : 0;

        return (
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Play className="text-primary" />
                Video Lesson
              </CardTitle>
              <CardDescription>
                Watch and learn at your own pace
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-lg overflow-hidden border">
                <video
                  src={selectedTask.VideoURL}
                  controls
                  onTimeUpdate={(e) => handleVideoProgress(selectedTask._id, e)}
                  className="w-full aspect-video"
                />
              </div>
              <div className="mt-6">
                <Label className="text-sm font-medium">Watching Progress</Label>
                <Progress value={watchProgress} className="mt-2 h-2" />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{watchProgress}% watched</span>
                  {progress?.isCompleted && (
                    <span className="flex items-center text-green-500">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "Quiz":
        return (
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-blue-500" />
                Knowledge Check
              </CardTitle>
              <CardDescription>Test your understanding</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {selectedTask.Question && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedTask.Question}
                  </h3>
                  <RadioGroup
                    onValueChange={(value) =>
                      handleQuizAnswer(selectedTask._id, 0, value)
                    }
                    className="space-y-3">
                    {selectedTask.Options &&
                      selectedTask.Options.map(
                        (option: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 transition-colors">
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}`}
                              className="h-5 w-5"
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        )
                      )}
                  </RadioGroup>
                </div>
              )}
              <Button
                onClick={() => submitQuiz(selectedTask._id)}
                className="w-full"
                disabled={submitting}
                variant="default">
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </CardContent>
          </Card>
        );

      case "Assignment":
        return (
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-green-500" />
                Practical Assignment
              </CardTitle>
              <CardDescription>Apply what you've learned</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-50 p-4 mb-4 rounded-md border">
                <p className="text-sm leading-relaxed">
                  {selectedTask.description ||
                    "Complete the assignment based on what you've learned."}
                </p>
              </div>
              <div className="space-y-4">
                <Label htmlFor="assignment" className="text-sm font-medium">
                  Your Solution
                </Label>
                <textarea
                  id="assignment"
                  value={assignmentSubmission}
                  onChange={(e) => setAssignmentSubmission(e.target.value)}
                  placeholder="Write your assignment solution here..."
                  className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
                <Button
                  onClick={() => submitAssignment(selectedTask._id)}
                  className="w-full"
                  disabled={submitting}
                  variant="default">
                  {submitting ? "Submitting..." : "Submit Assignment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="flex items-center justify-center h-full">
            <CardContent className="text-center p-6">
              <BookOpen className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
              <p>Content type not supported</p>
            </CardContent>
          </Card>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading course content...</p>
      </div>
    );
  }

  // No course found
  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Course details and lessons */}
        <div className="space-y-6">
          {/* Course info card */}
          <Card className="shadow-md overflow-hidden">
            <CardHeader className="bg-primary/10 pb-2">
              <CardTitle>{course.Title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <User className="h-4 w-4" />{" "}
                {course.Mentor_id?.name || "Instructor"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <Progress value={calculateProgress()} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {calculateProgress()}% Complete
                </p>

                <Separator />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{course.Duration || "Self-paced"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{course.Level || "All levels"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(
                        course.CreatedAt || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{course.Category.Category || "Technology"}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      About this course
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.Description || "No description available."}
                    </p>
                  </div>
                  <div>
                    <Button onClick={handleChatmentor}>Chat With Mentor</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons list */}
          <Card className="shadow-md">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Course Content</CardTitle>
              <CardDescription>
                {course.lessons.length} lessons •{" "}
                {course.lessons.reduce(
                  (total, lesson) => total + lesson.Task.length,
                  0
                )}{" "}
                tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {course.lessons.map((lesson, index) => (
                    <AccordionItem value={`lesson-${index}`} key={index}>
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="text-left">
                            <span className="font-medium">
                              {lesson.Lessone_name}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {lesson.Task.length} tasks
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {
                              lesson.Task.filter(
                                (task) => taskProgress[task._id]?.isCompleted
                              ).length
                            }
                            /{lesson.Task.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-2 space-y-1">
                          {lesson.Task.map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                                selectedTask?._id === task._id
                                  ? "bg-primary/10"
                                  : "hover:bg-slate-100"
                              }`}
                              onClick={() => setSelectedTask(task)}>
                              <div className="flex items-center gap-2">
                                {task.Type === "Video" && (
                                  <Play className="h-4 w-4 text-primary" />
                                )}
                                {task.Type === "Quiz" && (
                                  <FileText className="h-4 w-4 text-blue-500" />
                                )}
                                {task.Type === "Assignment" && (
                                  <BookOpen className="h-4 w-4 text-green-500" />
                                )}
                                <span className="text-sm">{task.Type}</span>
                              </div>
                              {taskProgress[task._id]?.isCompleted && (
                                <CheckCircle2 className="text-green-500 h-4 w-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Task content */}
        <div className="lg:col-span-2">
          {selectedTask ? (
            renderTaskContent()
          ) : (
            <Card className="flex items-center justify-center h-full shadow-md">
              <CardContent className="text-center py-16">
                <BookOpen className="mx-auto mb-4 w-16 h-16 text-primary/30" />
                <h3 className="text-xl font-medium mb-2">
                  Ready to Begin Learning?
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select a task from the course content to start your learning
                  journey
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseView;

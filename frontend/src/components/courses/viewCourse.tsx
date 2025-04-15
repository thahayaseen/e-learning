"use client";
import type React from "react";
import { useState, useEffect, useMemo } from "react";

// Add these imports at the top of the file
import { TipCard } from "@/components/ui/tip-card";
import { LearningProgressCard } from "@/components/learning-progress-card";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MessageCircle,
  Play,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getcertificate,
  getProgress,
  getSelectedCourse,
  requestmeeting,
  startChat,
  updateVideoProgress,
  validatequstion,
} from "@/services/fetchdata";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CourseRatingComponent from "./review";
// import CertificateDownload from "../course/certificta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Add this import at the top of the file
import { CourseResources } from "@/components/course-resources";
import CertificateDisplay from "../course/certificta";
import { setloading } from "@/lib/features/User";

// Interfaces
interface Course {
  _id: string;
  Title: string;
  Mentor_id: { _id: string; name: string };
  Description: string;
  lessons: Lesson[];
  Duration?: string;
  Level?: string;
  Category?: { Category: string };
  CreatedAt?: string;
  lessons_progress?: any;
}

interface Lesson {
  _id: string;
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
  Description?: string;
  VideoURL?: string;
  Question?: string;
  Options?: any;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Update the TaskProgress interface to include assignment submission data
interface TaskProgress {
  id: string;
  watchedDuration: number;
  totalDuration: number;
  isCompleted: boolean;
  submissionData?: string; // Add this to store assignment submissions
}

interface Meeting {
  _id: string;
  meetingTime: string;
  meetingLink?: string;
  status: string;
}
const certificateData = {
  studentName: "John Appleseed",
  courseName: "Advanced Web Development",
  category: "Computer Science",
  completedDate: new Date("2023-12-15"),
  certificateId: "CERT-2023-12345",
};
const CourseView = ({ id }: { id: string }) => {
  const [meet, setMeet] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [taskProgress, setTaskProgress] = useState<{
    [key: string]: TaskProgress;
  }>({});
  const [selectedlessonid, setLesson] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<string>();
  const [assignmentSubmission, setAssignmentSubmission] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  // const [certificateData, SetcertificateData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [totalprogres, settotalprogress] = useState(null);

  // Add these state variables after the other state declarations
  const [showTips, setShowTips] = useState(true);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // Add this state variable after the other state declarations
  // const [courseResources] = useState([
  //   {
  //     id: "1",
  //     title: "Course Syllabus",
  //     type: "pdf",
  //     url: "#",
  //     description: "Complete course outline and learning objectives",
  //     size: "1.2 MB",
  //   },
  //   {
  //     id: "2",
  //     title: "Additional Reading Materials",
  //     type: "link",
  //     url: "https://example.com/reading",
  //     description: "Supplementary articles and papers",
  //   },
  //   {
  //     id: "3",
  //     title: "Code Examples",
  //     type: "code",
  //     url: "#",
  //     description: "Sample code snippets for practical exercises",
  //     size: "450 KB",
  //   },
  //   {
  //     id: "4",
  //     title: "Video Tutorial: Advanced Concepts",
  //     type: "video",
  //     url: "#",
  //     description: "In-depth explanation of complex topics",
  //     size: "45 MB",
  //   },
  // ])

  // Meeting request states
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTime, setSelectedTime] = useState<string>("10:00");
  const [requestingMeeting, setRequestingMeeting] = useState(false);

  // Calculate available time slots for today (9AM to 5PM in 30 min increments)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  const timeSlots = getTimeSlots();

  // Add this array of tips after the timeSlots constant
  const learningTips = [
    {
      title: "Getting Started",
      tips: [
        "Watch videos completely to mark them as completed",
        "Take notes while watching videos for better retention",
        "Don't rush through the content - take your time to understand",
        "Use the chat feature if you need help from your mentor",
      ],
      variant: "info",
    },
    {
      title: "Quiz Tips",
      tips: [
        "Read each question carefully before answering",
        "Review the lesson content if you're unsure about an answer",
        "You can retake quizzes if you don't pass the first time",
        "Use the process of elimination for multiple choice questions",
      ],
      variant: "warning",
    },
    {
      title: "Assignment Tips",
      tips: [
        "Plan your solution before you start writing",
        "Be specific and detailed in your responses",
        "Proofread your work before submitting",
        "Apply concepts from the lessons in your assignments",
        "Don't hesitate to ask for clarification if needed",
      ],
      variant: "success",
    },
  ];

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

  // Helper function to find task progress in the progress data
  const findTaskProgressStatus = (taskId: string) => {
    if (!course) return null;

    // First check our local state
    if (taskProgress[taskId]) {
      return taskProgress[taskId];
    }

    // Use a ref to store the progress data to avoid repeated API calls
    if (!totalprogres) {
      // Only fetch if we don't have the data yet
      return getProgress(id)
        .then((ress) => {
          console.log(ress, "from findTaskProgressStatus");
          settotalprogress(ress.data.OverallScore);

          // Process and store all task progress data at once
          if (ress.data && ress.data.lesson_progress) {
            const newProgressData: { [key: string]: TaskProgress } = {};

            ress.data.lesson_progress.forEach((lessonProgress) => {
              if (lessonProgress.Task_progress) {
                lessonProgress.Task_progress.forEach((tp) => {
                  console.log(tp, "tp is ");

                  newProgressData[tp.Task_id] = {
                    id: tp.Task_id,
                    watchedDuration: lessonProgress.WatchTime || 0,
                    totalDuration: lessonProgress.WatchTime || 0,
                    isCompleted: tp.Completed || tp.Status === "Completed",
                    submissionData: tp.response || null,
                  };
                });
              }
            });

            // Update all task progress at once
            setTaskProgress((prev) => ({ ...prev, ...newProgressData }));

            // Return the requested task progress if available
            if (newProgressData[taskId]) {
              return newProgressData[taskId];
            }
          }
          return null;
        })
        .catch((error) => {
          console.error("Error fetching progress:", error);
          return null;
        });
    }

    return null;
  };

  // Add this helper function after the findTaskProgressStatus function
  const findTaskSubmissionData = (taskId: string) => {
    if (!course) return null;
    console.log(
      taskProgress[taskId],
      "alldata is ",
      taskProgress[taskId]?.submissionData
    );

    // First check our local state
    if (taskProgress[taskId]?.submissionData) {
      console.log("passeddd");

      return taskProgress[taskId].submissionData;
    }

    // If not found, look in the original progress data
    return getProgress(id)
      .then((ress) => {
        console.log(ress, "form find tasks");

        for (const lessonProgress of ress?.data?.lesson_progress || []) {
          const taskProgressItem = lessonProgress.Task_progress?.find(
            (tp) => tp.Task_id === taskId
          );
          if (taskProgressItem && taskProgressItem.SubmissionData) {
            return taskProgressItem.SubmissionData;
          }
        }

        return null;
      })
      .catch((error) => {
        console.error("Error fetching progress:", error);
        return null;
      });
  };

  const fetchCertificate = async () => {
    setloading(true);
    // (null);

    try {
      const response: any = await getcertificate(course._id);
      console.log(response, "data");

      if (!response.success) {
        throw new Error("Failed to fetch certificate data");
      }

      const data = await response.result;
      return { success: response.success, ...data };
    } catch (err) {
      // setError(err.message);
      console.error("Certificate fetch error:", err);
      toast.error(err instanceof Error?err.message:"Cannot get the certificate data")
    } finally {
      setloading(false);
    }
  };
  // Add this function to calculate completed items by type
  const calculateCompletedItemsByType = () => {
    if (!course) return { videos: 0, quizzes: 0, assignments: 0, lessons: 0 };

    let completedVideos = 0;
    let completedQuizzes = 0;
    let completedAssignments = 0;
    let completedLessons = 0;
    const totalLessons = course.lessons.length;

    // Count completed tasks by type
    course.lessons.forEach((lesson) => {
      let lessonCompleted = true;

      lesson.Task.forEach((task) => {
        const isCompleted = taskProgress[task._id]?.isCompleted;

        if (task.Type === "Video" && isCompleted) completedVideos++;
        else if (task.Type === "Quiz" && isCompleted) completedQuizzes++;
        else if (task.Type === "Assignment" && isCompleted)
          completedAssignments++;

        if (!isCompleted) lessonCompleted = false;
      });

      if (lessonCompleted) completedLessons++;
    });

    return {
      completedVideos,
      completedQuizzes,
      completedAssignments,
      completedLessons,
      totalLessons,
    };
  };

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = () => {
      setLoading(true);

      getSelectedCourse(id)
        .then((data) => {
          console.log(data, "data is sisisi");
          setCourse(data.data.data);
          setMeet(
            data.meet
              ? { ...data.meet, meetingTime: data.meet.scheduledTime }
              : data.meet
          );

          // Initialize task progress
          const initialProgress: { [key: string]: TaskProgress } = {};

          return getProgress(id).then((ress) => {
            console.log(ress, "progress data");
            settotalprogress(ress.data.OverallScore);

            // Map the lesson progress data to our task progress state
            if (ress.data && ress.data.lesson_progress) {
              ress.data.lesson_progress.forEach((lessonProgress) => {
                // For each lesson in the progress data
                if (lessonProgress.Lesson_id) {
                  // Add an entry for the lesson
                  initialProgress[lessonProgress.Lesson_id._id] = {
                    id: lessonProgress.Lesson_id._id,
                    watchedDuration: lessonProgress.WatchTime || 0,
                    totalDuration: lessonProgress.WatchTime || 0, // This will be updated when video loads
                    isCompleted: lessonProgress.Completed || false,
                  };

                  // Process task progress within each lesson
                  if (
                    lessonProgress.Task_progress &&
                    lessonProgress.Task_progress.length > 0
                  ) {
                    lessonProgress.Task_progress.forEach((taskProgress) => {
                      console.log("taskprosses", taskProgress);

                      initialProgress[taskProgress.Task_id] = {
                        id: taskProgress.Task_id,
                        watchedDuration: 0, // No watch time for non-video tasks
                        totalDuration: 0,
                        isCompleted:
                          taskProgress.Completed ||
                          taskProgress.Status === "Completed",
                        submissionData: taskProgress.response || " ", // Store submission data
                      };
                    });
                  }
                }
              });
            }

            setTaskProgress(initialProgress);

            // Select first task by default
            if (
              data.data.data.lessons.length > 0 &&
              data.data.data.lessons[0].Task.length > 0
            ) {
              setSelectedTask(data.data.data.lessons[0].Task[0]);
              setLesson(data.data.data.lessons[0]._id);
            }

            return data;
          });
        })
        .catch((error) => {
          console.error("Error fetching course:", error);
          toast.error("Failed to load course content");
        })
        .finally(() => {
          setLoading(false);
        });
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

      if (!progress.isCompleted) {
        toast.success("Video lesson completed!");
      }
    }
    console.log(updatedProgress.isCompleted,'lastis');
    
    console.log("sdfsafsadf");

    // Call the updated function with the correct parameters for video type
    updateVideoProgress(
      course?._id, // Course ID
      taskId, // Task ID
      updatedProgress.watchedDuration, // Current watch time
      updatedProgress.isCompleted, // Whether the video is completed,
      undefined,
      undefined,
      selectedlessonid
    )
      .then((resdata) => {
        console.log("updated data is ", resdata);
        setTaskProgress((prev) => ({
          ...prev,
          [taskId]: updatedProgress,
        }));
      })
      .catch((error) => {
        console.error("Error updating video progress:", error);
      });
  };

  // Quiz answer handler
  const handleQuizAnswer = (answer: string) => {
    setQuizAnswers(answer);
 
  };

  const handleChatmentor = () => {
    if (!course) return;

    startChat(String(course._id))
      .then((roomid) => {
        router.push("/course/chat/" + roomid);
      })
      .catch((error) => {
        console.error("Error starting chat:", error);
        toast.error("Failed to start chat with mentor");
      });
  };

  // Request meeting handler
  const handleRequestMeeting = () => {
    if (!course) return;

    setRequestingMeeting(true);

    // Create a datetime string from the selected date and time
    const meetingDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

    // Call API to request meeting
    requestmeeting(course.Mentor_id._id, meetingDateTime.toString(), course._id)
      .then((result) => {
        // Update meeting state with the new meeting
        console.log(result, "resulst is ");

        setMeet({
          _id: "2412341232345",
          meetingTime: meetingDateTime.toString(),
          status: "Pending",
        });

        toast.success(
          `Meeting scheduled for ${meetingDateTime.toLocaleString()}`
        );

        // Close dialog
        setMeetingDialogOpen(false);
      })
      .catch((error) => {
        console.error("Error requesting meeting:", error);
        toast.error("Failed to schedule meeting. Please try again.");
      })
      .finally(() => {
        setRequestingMeeting(false);
      });
  };

  // Join meeting handler
  const handleJoinMeeting = () => {
    if (meet?.meetingLink) {
      window.open(meet.meetingLink, "_blank");
    } else {
      toast.error("Meeting link is not yet available");
    }
  };

  // Submit quiz
  const submitQuiz = (taskId: string, id: string) => {
    if (!quizAnswers) {
      toast.error("Please select an answer before submitting");
      return;
    }

    setSubmitting(true);

    validatequstion(id, taskId, quizAnswers)
      .then((result) => {
        console.log("Quiz validation result:", result);

        if (result && result.success) {
          toast.success("Great job! You've answered correctly.");

          // Mark as completed in local state
          setTaskProgress((prev) => ({
            ...prev,
            [taskId]: {
              ...prev[taskId],
              isCompleted: true,
            },
          }));

          // Update progress on the server for Quiz type
          return updateVideoProgress(
            course?._id, // Course ID
            taskId, // Task ID
            undefined, // No watch time for quiz
            true, // Completed
            undefined, // No response for quiz
            result.score || 100, // Score from validation or default to 100
            selectedlessonid
          );
        } else {
          toast.error("Incorrect answer. Please try again.");
        }
      })
      .catch((error: any) => {
        console.error("Quiz submission error:", error);
        const errorMessage = error?.message || "Failed to submit answer";
        toast.error(errorMessage);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Update the submitAssignment function to store the submission data
  const submitAssignment = (taskId: string) => {
    if (!assignmentSubmission.trim()) {
      toast.error("Please write your solution before submitting");
      return;
    }

    setSubmitting(true);

    // Store the submission text to avoid state dependency in the async operation
    const submissionText = assignmentSubmission;

    // Update UI immediately for better user experience
    setTaskProgress((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isCompleted: true,
        submissionData: submissionText,
      },
    }));

    // Make API call in the background
    updateVideoProgress(
      course?._id,
      taskId,
      undefined,
      true,
      submissionText,
      undefined,
      selectedlessonid
    )
      .then((ans) => {
        console.log("the updated answer is ", ans);
        toast.success("Assignment submitted successfully!");

        // Clear the input only after successful submission
        setAssignmentSubmission("");
      })
      .catch((error) => {
        console.error("Error submitting assignment:", error);
        toast.error("Failed to submit assignment. Please try again.");

        // Revert the optimistic update on error
        setTaskProgress((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            isCompleted: false,
            submissionData: null,
          },
        }));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const shuffledOptions = useMemo(() => {
    return selectedTask?.Options ? shuffleArray(selectedTask.Options) : [];
  }, [selectedTask?.Options]);
  
  // Navigate to next task
  const navigateToNextTask = () => {
    if (!course || !selectedTask) return;

    // Find current lesson and task
    let currentLessonIdx = -1;
    let currentTaskIdx = -1;

    for (let i = 0; i < course.lessons.length; i++) {
      const taskIndex = course.lessons[i].Task.findIndex(
        (task) => task._id === selectedTask._id
      );
      if (taskIndex !== -1) {
        currentLessonIdx = i;
        currentTaskIdx = taskIndex;
        break;
      }
    }

    if (currentLessonIdx === -1 || currentTaskIdx === -1) return;

    // Check if there's another task in current lesson
    if (currentTaskIdx < course.lessons[currentLessonIdx].Task.length - 1) {
      setSelectedTask(
        course.lessons[currentLessonIdx].Task[currentTaskIdx + 1]
      );
    }
    // Move to next lesson
    else if (currentLessonIdx < course.lessons.length - 1) {
      if (course.lessons[currentLessonIdx + 1].Task.length > 0) {
        setCurrentLessonIndex(currentLessonIdx + 1);
        setSelectedTask(course.lessons[currentLessonIdx + 1].Task[0]);
        setLesson(course.lessons[currentLessonIdx + 1]._id);
      }
    }
  };

  // Render task content based on type
  const renderTaskContent = () => {
    if (!selectedTask) return null;

    switch (selectedTask.Type) {
      case "Video":
        const progress =
          taskProgress[selectedTask._id] ||
          findTaskProgressStatus(selectedTask._id);
        const watchProgress = progress
          ? Math.floor(
              (progress.watchedDuration / (progress.totalDuration || 1)) * 100
            )
          : 0;

        return (
          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="bg-white p-1.5 rounded-full shadow-sm">
                  <Play className="text-primary h-5 w-5" />
                </div>
                Video Lesson
              </CardTitle>
              <CardDescription className="text-gray-600">
                Watch and learn at your own pace
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-lg overflow-hidden border shadow-sm">
                <video
                  src={selectedTask.VideoURL}
                  controls
                  onTimeUpdate={(e) => handleVideoProgress(selectedTask._id, e)}
                  className="w-full aspect-video"
                  poster="/placeholder.svg?height=480&width=854"
                />
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Watching Progress
                  </Label>
                  {progress?.isCompleted && (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
                    </span>
                  )}
                </div>
                <Progress
                  value={watchProgress}
                  className="mt-2 h-2.5 bg-gray-100"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{watchProgress}% watched</span>
                  <span>
                    {progress?.watchedDuration || 0}s /{" "}
                    {progress?.totalDuration || 0}s
                  </span>
                </div>
              </div>

              {/* Notes section - NEW */}
              <div className="mt-6 border-t pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Take Notes
                </h4>
                <textarea
                  placeholder="Write your notes here to help you remember key points..."
                  className="w-full h-24 p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none text-sm"
                />
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Save Notes
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={navigateToNextTask}
                  variant="default"
                  className="ml-auto group"
                  disabled={!progress?.isCompleted}>
                  {progress?.isCompleted
                    ? "Continue to Next"
                    : "Complete Video to Continue"}
                  {progress?.isCompleted && (
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "Quiz":
        const quizTips = [
          "Read each question carefully before selecting an answer",
          "Eliminate obviously incorrect options first",
          "Review related lesson content if you're unsure",
          "Take your time - accuracy is more important than speed",
        ];

        return (
          <Card className="shadow-lg border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="bg-blue-100 p-1.5 rounded-full shadow-sm">
                  <FileText className="text-blue-600 h-5 w-5" />
                </div>
                Knowledge Check
              </CardTitle>
              <CardDescription className="text-gray-600">
                Test your understanding of the material
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <TipCard
                  title="Quiz Tips"
                  tips={quizTips}
                  variant="warning"
                  className="mb-6"
                />
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-6 text-gray-800">
                  {selectedTask.Question || "Complete the quiz below"}
                </h3>
                {selectedTask.Question && (
                  <RadioGroup
                    onValueChange={(value) => handleQuizAnswer(value)}
                    className="space-y-3">
                    {shuffledOptions &&
                      shuffledOptions.map(
                        (option: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 border p-4 rounded-md hover:bg-blue-50/50 transition-colors">
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}`}
                              className="h-5 w-5 text-blue-600"
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer text-gray-700">
                              {option}
                            </Label>
                          </div>
                        )
                      )}
                  </RadioGroup>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => submitQuiz(selectedTask._id, id)}
                  disabled={submitting || !quizAnswers}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? "Submitting..." : "Submit Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      // Replace the Assignment case in renderTaskContent with this enhanced version
      case "Assignment":
        // Check if there's a previous submission
        const previousSubmission = findTaskSubmissionData(selectedTask._id);
        const isTaskCompleted = taskProgress[selectedTask._id]?.isCompleted;

        return (
          <Card className="shadow-lg border-green-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="bg-green-100 p-1.5 rounded-full shadow-sm">
                  <BookOpen className="text-green-600 h-5 w-5" />
                </div>
                Practical Assignment
              </CardTitle>
              <CardDescription className="text-gray-600">
                Apply what you've learned to real-world scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Assignment description with enhanced styling */}
              <div className="bg-gradient-to-r from-green-50 to-white p-5 mb-6 rounded-md border shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Assignment Instructions
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedTask.Description ||
                    selectedTask.description ||
                    "Complete the assignment based on what you've learned."}
                </p>
              </div>

              {/* Tips section - NEW */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
                <h4 className="text-sm font-semibold flex items-center text-blue-700 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Tips for Success
                </h4>
                <ul className="text-xs text-blue-700 space-y-1 ml-5 list-disc">
                  <li>Read the instructions carefully before starting</li>
                  <li>Apply concepts learned in previous lessons</li>
                  <li>Be specific and detailed in your solution</li>
                  <li>Review your work before submitting</li>
                  <li>
                    Don't hesitate to use the "Chat with Mentor" feature if you
                    need help
                  </li>
                </ul>
              </div>

              {/* Previous submission section - NEW */}
              {isTaskCompleted && previousSubmission && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Your Previous Submission
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-600 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 text-sm">
                    <pre className="whitespace-pre-wrap font-sans">
                      {previousSubmission}
                    </pre>
                  </div>
                </div>
              )}

              {/* Solution input area */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="assignment"
                    className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span>Your Solution</span>
                    {isTaskCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-600 hover:text-blue-700"
                        onClick={() =>
                          previousSubmission &&
                          setAssignmentSubmission(previousSubmission)
                        }>
                        Edit Previous Submission
                      </Button>
                    )}
                  </Label>
                  <textarea
                    id="assignment"
                    value={assignmentSubmission}
                    onChange={(e) => {
                      // Use a function form of setState to ensure we're working with the latest state
                      setAssignmentSubmission(e.target.value);
                    }}
                    placeholder={
                      isTaskCompleted
                        ? "Edit your submission or write a new solution..."
                        : "Write your assignment solution here..."
                    }
                    className="w-full h-40 p-4 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none resize-none mt-2 bg-white text-gray-800"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {assignmentSubmission.length > 0
                      ? `${assignmentSubmission.length} characters`
                      : "No content yet"}
                  </div>
                  <Button
                    onClick={() => submitAssignment(selectedTask._id)}
                    disabled={submitting || !assignmentSubmission.trim()}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700">
                    {submitting
                      ? "Submitting..."
                      : isTaskCompleted
                      ? "Update Submission"
                      : "Submit Assignment"}
                  </Button>
                </div>
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

  // Render meeting status badge
  const renderMeetingStatusBadge = () => {
    if (!meet) return null;

    switch (meet.status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200">
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{meet.status}</Badge>;
    }
  };

  // Calculate lesson progress
  const calculateLessonProgress = (lessonTasks: Task[]) => {
    console.log("from herere");

    if (lessonTasks.length === 0) return 0;

    let completedTasks = 0;

    lessonTasks.forEach(async (task) => {
      console.log(
        JSON.stringify(taskProgress),
        task,
        "ans is ",
        taskProgress[task._id]
      );
      // Check if we have progress data for this task
      if (taskProgress[task._id]?.isCompleted) {
        completedTasks++;
      }
    });

    return Math.round((completedTasks / lessonTasks.length) * 100);
  };

  // Calculate task type statistics
  const calculateTaskTypeStats = () => {
    if (!course) return { videos: 0, quizzes: 0, assignments: 0 };

    let videos = 0;
    let quizzes = 0;
    let assignments = 0;

    course.lessons.forEach((lesson) => {
      lesson.Task.forEach((task) => {
        if (task.Type === "Video") videos++;
        else if (task.Type === "Quiz") quizzes++;
        else if (task.Type === "Assignment") assignments++;
      });
    });

    return { videos, quizzes, assignments };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading course content...</p>
        </div>
      </div>
    );
  }

  // No course found
  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-8 max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested course could not be found or has been removed.
          </p>
          <Button onClick={() => router.push("/courses")}>
            Return to Courses
          </Button>
        </div>
      </div>
    );
  }

  const taskTypeStats = calculateTaskTypeStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Left side - Course details and lessons */}
        <div className="space-y-6 lg:col-span-1">
          {/* Course info card */}
          <Card className="shadow-md overflow-hidden border-gray-100">
            <CardHeader className="bg-gradient-to-r from-primary/15 to-primary/5 pb-4">
              <CardTitle className="text-xl text-gray-800">
                {course.Title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-gray-600">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src="/placeholder.svg?height=24&width=24"
                    alt={course.Mentor_id?.name || "Instructor"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {course.Mentor_id?.name?.charAt(0) || "I"}
                  </AvatarFallback>
                </Avatar>
                {course.Mentor_id?.name || "Instructor"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">
                      Course Progress
                    </span>
                    <span className="font-semibold text-primary">
                      {totalprogres}%
                    </span>
                  </div>
                  <Progress
                    value={totalprogres}
                    className="h-2.5 bg-gray-100"
                  />
                </div>

                {/* Enhanced Learning Progress Dashboard */}
                <div className="space-y-4">
                  {showTips && (
                    <TipCard
                      title={learningTips[activeTipIndex].title}
                      tips={learningTips[activeTipIndex].tips}
                      variant={learningTips[activeTipIndex].variant as any}
                      onClose={() => setShowTips(false)}
                      className="mb-4"
                    />
                  )}

                  {/* Learning Progress Card */}
                  {(() => {
                    const stats = calculateTaskTypeStats();
                    const completed = calculateCompletedItemsByType();

                    return (
                      <LearningProgressCard
                        overallProgress={totalprogres || 0}
                        completedLessons={completed.completedLessons}
                        totalLessons={completed.totalLessons}
                        completedVideos={completed.completedVideos}
                        totalVideos={stats.videos}
                        completedQuizzes={completed.completedQuizzes}
                        totalQuizzes={stats.quizzes}
                        completedAssignments={completed.completedAssignments}
                        totalAssignments={stats.assignments}
                        estimatedTimeLeft={
                          totalprogres === 100 ? undefined : "2 hours"
                        }
                      />
                    );
                  })()}
                </div>

                <Separator className="bg-gray-100" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-gray-700">
                      About this course
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {course.Description || "No description available."}
                    </p>
                  </div>

                  {/* Meeting status section (if meeting exists) */}
                  {meet && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Meeting with Mentor
                        </h4>
                        <div className="flex items-center">
                          {renderMeetingStatusBadge()}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 flex items-center">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        {new Date(
                          meet.meetingTime
                        ).toLocaleDateString()} at{" "}
                        {new Date(meet.meetingTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {meet.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={handleJoinMeeting}
                          className="w-full">
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      onClick={handleChatmentor}
                      className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                      <MessageCircle className="h-4 w-4 mr-2" /> Chat with
                      Mentor
                    </Button>
                    {!meet ? (
                      <Button
                        size="sm"
                        onClick={() => setMeetingDialogOpen(true)}
                        className="flex-1"
                        variant="outline">
                        <Calendar className="h-4 w-4 mr-2" /> Request Meeting
                      </Button>
                    ) : meet.status === "rejected" ? (
                      <Button
                        size="sm"
                        onClick={() => setMeetingDialogOpen(true)}
                        className="flex-1"
                        variant="outline">
                        <Calendar className="h-4 w-4 mr-2" /> Request Again
                      </Button>
                    ) : null}
                  </div>

                  {totalprogres == 100 && (
                    <CertificateDisplay
                      {...certificateData}
                      fetchCertificate={fetchCertificate}
                      courseId={course._id}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Course Resources */}
          {/* <CourseResources resources={courseResources} className="mb-6" /> */}

          {/* Lessons list */}
          <Card className="shadow-md border-gray-100 max-h-[70vh] overflow-auto">
            <CardHeader className="pb-2 sticky top-0 bg-white z-10">
              <CardTitle className="text-lg text-gray-800">
                Course Content
              </CardTitle>
              <CardDescription className="text-gray-600">
                {course.lessons.length} lessons •{" "}
                {course.lessons.reduce(
                  (total, lesson) => total + lesson.Task.length,
                  0
                )}{" "}
                tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[450px] pr-4">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue={`lesson-${currentLessonIndex}`}>
                  {course.lessons.map((lesson, index) => {
                    const lessonProgress = calculateLessonProgress(lesson.Task);

                    return (
                      <AccordionItem
                        value={`lesson-${index}`}
                        key={index}
                        className="border-gray-100">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center justify-between w-full pr-2">
                            <div className="text-left flex items-center gap-2">
                              <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-primary">
                                {index + 1}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  {lesson.Lessone_name}
                                </span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {lesson.Task.length}{" "}
                                  {lesson.Task.length === 1 ? "task" : "tasks"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`
                                ${
                                  lessonProgress === 100
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : lessonProgress > 0
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                }
                              `}>
                                {lessonProgress}%
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-4 space-y-1 mt-1">
                            {lesson.Task.map((task, taskIndex) => {
                              const isCompleted =
                                taskProgress[task._id]?.isCompleted;
                              const isActive = selectedTask?._id === task._id;

                              return (
                                <div
                                  key={taskIndex}
                                  className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors ${
                                    isActive
                                      ? "bg-primary/10 text-primary font-medium"
                                      : isCompleted
                                      ? "bg-green-50 text-green-700"
                                      : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setLesson(lesson._id);
                                  }}>
                                  <div className="flex items-center gap-2">
                                    {task.Type === "Video" && (
                                      <Play
                                        className={`h-4 w-4 ${
                                          isActive
                                            ? "text-primary"
                                            : isCompleted
                                            ? "text-green-500"
                                            : "text-blue-500"
                                        }`}
                                      />
                                    )}
                                    {task.Type === "Quiz" && (
                                      <FileText
                                        className={`h-4 w-4 ${
                                          isActive
                                            ? "text-primary"
                                            : isCompleted
                                            ? "text-green-500"
                                            : "text-blue-500"
                                        }`}
                                      />
                                    )}
                                    {task.Type === "Assignment" && (
                                      <BookOpen
                                        className={`h-4 w-4 ${
                                          isActive
                                            ? "text-primary"
                                            : isCompleted
                                            ? "text-green-500"
                                            : "text-green-500"
                                        }`}
                                      />
                                    )}
                                    <span className="text-sm truncate">
                                      {task.Type === "Video"
                                        ? "Video: "
                                        : task.Type === "Quiz"
                                        ? "Quiz: "
                                        : "Assignment: "}
                                      {taskIndex + 1}
                                    </span>
                                  </div>
                                  {isCompleted && (
                                    <CheckCircle2 className="text-green-500 h-4 w-4" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        {/* <ScrollArea className="lg:col-span-2 sticky"> */}
        <div className="lg:col-span-2 space-y-6">
          <div className="sticky top-8 max-h-[90vh] overflow-y-auto rounded-lg">
            {selectedTask ? (
              renderTaskContent()
            ) : (
              <Card className="flex items-center justify-center h-full shadow-lg border-gray-100">
                <CardContent className="text-center p-8">
                  <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700">
                    Select a task to get started
                  </p>
                  <p className="text-sm text-gray-500 mt-2 max-w-md">
                    Choose a lesson from the left sidebar to view its content
                    and begin your learning journey.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {/* </ScrollArea> */}
        {/* Right side - Task content */}
      </div>

      {/* Meeting Request Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="bg-white border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-800">
              Request a Meeting
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Schedule a one-on-one session with your mentor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-gray-700">
                Select Date
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="mt-1 bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-gray-700">
                Select Time
              </Label>
              <Tabs
                defaultValue={selectedTime}
                onValueChange={(value) => setSelectedTime(value)}
                className="mt-1">
                <TabsList className="grid grid-cols-4 gap-2 h-auto p-2 bg-gray-50">
                  {timeSlots.map((slot) => (
                    <TabsTrigger
                      key={slot}
                      value={slot}
                      className="py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                      {slot}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleRequestMeeting}
              disabled={requestingMeeting}
              className="w-full sm:w-auto">
              {requestingMeeting ? "Scheduling..." : "Request Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CourseRatingComponent courseid={id} />
    </div>
  );
};

export default CourseView;

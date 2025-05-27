"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, MessageCircle, Play, FileText, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LearningProgressCard } from "@/components/learning-progress-card"
import { TipCard } from "@/components/ui/tip-card"
import CertificateDisplay from "../../course/certificta"
import type { Course, Meeting, Task, TaskProgress } from "@/type/course"

// Learning tips data
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
]

// Certificate data (placeholder)
const certificateData = {
  studentName: "John Appleseed",
  courseName: "Advanced Web Development",
  category: "Computer Science",
  completedDate: new Date("2023-12-15"),
  certificateId: "CERT-2023-12345",
}

interface CourseSidebarProps {
  course: Course
  meet: Meeting | null
  taskProgress: { [key: string]: TaskProgress }
  currentLessonIndex: number
  selectedTask: Task | null
  setSelectedTask: (task: Task) => void
  setLesson: (lessonId: string) => void
  totalProgress: number
  onChatWithMentor: () => void
  onRequestMeeting: () => void
  onJoinMeeting: () => void
}

const CourseSidebar = ({
  course,
  meet,
  taskProgress,
  currentLessonIndex,
  selectedTask,
  setSelectedTask,
  setLesson,
  totalProgress,
  onChatWithMentor,
  onRequestMeeting,
  onJoinMeeting,
}: CourseSidebarProps) => {
  const [showTips, setShowTips] = useState(true)
  const [activeTipIndex, setActiveTipIndex] = useState(0)

  // Calculate lesson progress
  const calculateLessonProgress = (lessonTasks: Task[]) => {
    if (lessonTasks.length === 0) return 0

    let completedTasks = 0

    lessonTasks.forEach((task) => {
      if (taskProgress[task._id]?.isCompleted) {
        completedTasks++
      }
    })

    return Math.round((completedTasks / lessonTasks.length) * 100)
  }

  // Calculate task type statistics
  const calculateTaskTypeStats = () => {
    if (!course) return { videos: 0, quizzes: 0, assignments: 0 }

    let videos = 0
    let quizzes = 0
    let assignments = 0

    course.lessons.forEach((lesson) => {
      lesson.Task.forEach((task) => {
        if (task.Type === "Video") videos++
        else if (task.Type === "Quiz") quizzes++
        else if (task.Type === "Assignment") assignments++
      })
    })

    return { videos, quizzes, assignments }
  }

  // Calculate completed items by type
  const calculateCompletedItemsByType = () => {
    let completedVideos = 0
    let completedQuizzes = 0
    let completedAssignments = 0
    let completedLessons = 0
    const totalLessons = course.lessons.length

    // Count completed tasks by type
    course.lessons.forEach((lesson) => {
      let lessonCompleted = true

      lesson.Task.forEach((task) => {
        const isCompleted = taskProgress[task._id]?.isCompleted

        if (task.Type === "Video" && isCompleted) completedVideos++
        else if (task.Type === "Quiz" && isCompleted) completedQuizzes++
        else if (task.Type === "Assignment" && isCompleted) completedAssignments++

        if (!isCompleted) lessonCompleted = false
      })

      if (lessonCompleted) completedLessons++
    })

    return {
      completedVideos,
      completedQuizzes,
      completedAssignments,
      completedLessons,
      totalLessons,
    }
  }

  // Render meeting status badge
  const renderMeetingStatusBadge = () => {
    if (!meet) return null

    switch (meet.status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Calendar className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Calendar className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{meet.status}</Badge>
    }
  }

  const stats = calculateTaskTypeStats()
  const completed = calculateCompletedItemsByType()

  return (
    <div className="space-y-6 lg:col-span-1">
      {/* Course info card */}
      <Card className="shadow-md overflow-hidden border-gray-100">
        <CardHeader className="bg-gradient-to-r from-primary/15 to-primary/5 pb-4">
          <CardTitle className="text-xl text-gray-800">{course.Title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-gray-600">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg?height=24&width=24" alt={course.Mentor_id?.name || "Instructor"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {course.Mentor_id?.name?.charAt(0) || "I"}
              </AvatarFallback>
            </Avatar>
            {course.Mentor_id?.name || "Instructor"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-5">
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
              <LearningProgressCard
                overallProgress={totalProgress}
                completedLessons={completed.completedLessons}
                totalLessons={completed.totalLessons}
                completedVideos={completed.completedVideos}
                totalVideos={stats.videos}
                completedQuizzes={completed.completedQuizzes}
                totalQuizzes={stats.quizzes}
                completedAssignments={completed.completedAssignments}
                totalAssignments={stats.assignments}
                estimatedTimeLeft={totalProgress === 100 ? undefined : "2 hours"}
              />
            </div>

            <Separator className="bg-gray-100" />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">About this course</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {course.Description || "No description available."}
                </p>
              </div>

              {/* Meeting status section (if meeting exists) */}
              {meet && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Meeting with Mentor</h4>
                    <div className="flex items-center">{renderMeetingStatusBadge()}</div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 flex items-center">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {new Date(meet.meetingTime).toLocaleDateString()} at{" "}
                    {new Date(meet.meetingTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {meet.status === "approved" && (
                    <Button size="sm" onClick={onJoinMeeting} className="w-full">
                      Join Meeting
                    </Button>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={onChatWithMentor}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Chat with Mentor
                </Button>
                {!meet ? (
                  <Button size="sm" onClick={onRequestMeeting} className="flex-1 text-white" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" /> Request Meeting
                  </Button>
                ) : meet.status === "rejected" ? (
                  <Button size="sm" onClick={onRequestMeeting} className="flex-1" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" /> Request Again
                  </Button>
                ) : null}
              </div>

              {totalProgress === 100 && (
                <CertificateDisplay
                  {...certificateData}
                  fetchCertificate={() => Promise.resolve({ success: true })}
                  courseId={course._id}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons list */}
      <Card className="shadow-md border-gray-100 max-h-[70vh] overflow-auto">
        <CardHeader className="pb-2 sticky top-0 bg-white z-10">
          <CardTitle className="text-lg text-gray-800">Course Content</CardTitle>
          <CardDescription className="text-gray-600">
            {course.lessons.length} lessons • {course.lessons.reduce((total, lesson) => total + lesson.Task.length, 0)}{" "}
            tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[450px] pr-4">
            <Accordion type="single" collapsible className="w-full" defaultValue={`lesson-${currentLessonIndex}`}>
              {course.lessons.map((lesson, index) => {
                const lessonProgress = calculateLessonProgress(lesson.Task)

                return (
                  <AccordionItem value={`lesson-${index}`} key={index} className="border-gray-100">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="text-left flex items-center gap-2">
                          <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{lesson.Lessone_name}</span>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {lesson.Task.length} {lesson.Task.length === 1 ? "task" : "tasks"}
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
                          `}
                          >
                            {lessonProgress}%
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-4 space-y-1 mt-1">
                        {lesson.Task.map((task, taskIndex) => {
                          const isCompleted = taskProgress[task._id]?.isCompleted
                          const isActive = selectedTask?._id === task._id

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
                                setSelectedTask(task)
                                setLesson(lesson._id)
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {task.Type === "Video" && (
                                  <Play
                                    className={`h-4 w-4 ${
                                      isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-blue-500"
                                    }`}
                                  />
                                )}
                                {task.Type === "Quiz" && (
                                  <FileText
                                    className={`h-4 w-4 ${
                                      isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-blue-500"
                                    }`}
                                  />
                                )}
                                {task.Type === "Assignment" && (
                                  <BookOpen
                                    className={`h-4 w-4 ${
                                      isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-green-500"
                                    }`}
                                  />
                                )}
                                <span className="text-sm truncate">
                                  {task.Type === "Video" ? "Video: " : task.Type === "Quiz" ? "Quiz: " : "Assignment: "}
                                  {taskIndex + 1}
                                </span>
                              </div>
                              {isCompleted && <CheckCircle2 className="text-green-500 h-4 w-4" />}
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default CourseSidebar

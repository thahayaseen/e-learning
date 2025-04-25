"use client"
import { useState, useMemo } from "react"
import type React from "react"

import { Play, FileText, BookOpen, CheckCircle2, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { TipCard } from "@/components/ui/tip-card"
import { updateVideoProgress, validatequstion } from "@/services/fetchdata"
import toast from "react-hot-toast"
import type { Course, Task, TaskProgress } from "@/types/course"
import { getImage } from "@/services/getImage"

interface CourseContentProps {
  course: Course
  selectedTask: Task | null
  taskProgress: { [key: string]: TaskProgress }
  setTaskProgress: (taskProgress: { [key: string]: TaskProgress }) => void
  selectedlessonid: string
  navigateToNextTask: () => void
  settotalprogress: (progress: number) => void
}

const CourseContent = ({
  course,
  selectedTask,
  taskProgress,
  setTaskProgress,
  selectedlessonid,
  navigateToNextTask,
  settotalprogress,
}: CourseContentProps) => {
  const [quizAnswers, setQuizAnswers] = useState<string>()
  const [assignmentSubmission, setAssignmentSubmission] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Helper function to find task progress in the progress data
  const findTaskProgressStatus = (taskId: string) => {
    if (!taskProgress[taskId]) {
      return null
    }
    return taskProgress[taskId]
  }

  // Helper function to find task submission data
  const findTaskSubmissionData = (taskId: string) => {
    if (!taskProgress[taskId]?.submissionData) {
      return null
    }
    return taskProgress[taskId].submissionData
  }

  // Video progress handler
  const handleVideoProgress = (taskId: string, event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    const progress = taskProgress[taskId]

    // Update watched duration
    const updatedProgress = {
      ...progress,
      watchedDuration: Math.floor(video.currentTime),
      totalDuration: Math.floor(video.duration),
    }

    // Mark as completed if watched more than 90%
    if (video.currentTime / video.duration > 0.9) {
      updatedProgress.isCompleted = true

      if (!progress.isCompleted) {
        toast.success("Video lesson completed!")
      }
    }

    // Call the updated function with the correct parameters for video type
    updateVideoProgress(
      course?._id, // Course ID
      taskId, // Task ID
      updatedProgress.watchedDuration, // Current watch time
      updatedProgress.isCompleted, // Whether the video is completed,
      undefined,
      undefined,
      selectedlessonid,
    )
      .then((resdata) => {
        setTaskProgress((prev) => ({
          ...prev,
          [taskId]: updatedProgress,
        }))
      })
      .catch((error) => {
        console.error("Error updating video progress:", error)
      })
  }

  // Quiz answer handler
  const handleQuizAnswer = (answer: string) => {
    setQuizAnswers(answer)
  }

  // Submit quiz
  const submitQuiz = (taskId: string, courseId: string) => {
    if (!quizAnswers) {
      toast.error("Please select an answer before submitting")
      return
    }

    setSubmitting(true)

    validatequstion(courseId, taskId, quizAnswers)
      .then((result) => {
        if (result && result.success) {
          toast.success("Great job! You've answered correctly.")

          // Mark as completed in local state
          setTaskProgress((prev) => ({
            ...prev,
            [taskId]: {
              ...prev[taskId],
              isCompleted: true,
            },
          }))

          // Update progress on the server for Quiz type
          updateVideoProgress(
            course?._id, // Course ID
            taskId, // Task ID
            undefined, // No watch time for quiz
            true, // Completed
            undefined, // No response for quiz
            100, // Score from validation or default to 100
            selectedlessonid,
          ).then((data: any) => {
            settotalprogress(data.data.OverallScore)
          })
        } else {
          toast.error("Incorrect answer. Please try again.")
        }
      })
      .catch((error: any) => {
        console.error("Quiz submission error:", error)
        const errorMessage = error?.message || "Failed to submit answer"
        toast.error(errorMessage)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  // Submit assignment
  const submitAssignment = (taskId: string) => {
    if (!assignmentSubmission.trim()) {
      toast.error("Please write your solution before submitting")
      return
    }

    setSubmitting(true)

    // Store the submission text to avoid state dependency in the async operation
    const submissionText = assignmentSubmission

    // Update UI immediately for better user experience
    setTaskProgress((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isCompleted: true,
        submissionData: submissionText,
      },
    }))

    // Make API call in the background
    updateVideoProgress(course?._id, taskId, undefined, true, submissionText, undefined, selectedlessonid)
      .then((ans) => {
        toast.success("Assignment submitted successfully!")

        // Clear the input only after successful submission
        setAssignmentSubmission("")
      })
      .catch((error) => {
        console.error("Error submitting assignment:", error)
        toast.error("Failed to submit assignment. Please try again.")

        // Revert the optimistic update on error
        setTaskProgress((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            isCompleted: false,
            submissionData: null,
          },
        }))
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  // Shuffle array for quiz options
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const shuffledOptions = useMemo(() => {
    return selectedTask?.Options ? shuffleArray(selectedTask.Options) : []
  }, [selectedTask?.Options])

  if (!selectedTask) {
    return (
      <Card className="flex items-center justify-center h-full shadow-lg border-gray-100">
        <CardContent className="text-center p-8">
          <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-700">Select a task to get started</p>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            Choose a lesson from the left sidebar to view its content and begin your learning journey.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Render task content based on type
  switch (selectedTask.Type) {
    case "Video":
      const progress = taskProgress[selectedTask._id] || findTaskProgressStatus(selectedTask._id)

      const watchProgress = progress ? Math.floor((progress.watchedDuration / (progress.totalDuration || 1)) * 100) : 0

      return (
        <Card className="shadow-lg border-primary/10 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="bg-white p-1.5 rounded-full shadow-sm">
                <Play className="text-primary h-5 w-5" />
              </div>
              Video Lesson
            </CardTitle>
            <CardDescription className="text-gray-600">Watch and learn at your own pace</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-lg overflow-hidden border shadow-sm">
              <video
                src={getImage(selectedTask.VideoURL)}
                controls
                onTimeUpdate={(e) => handleVideoProgress(selectedTask._id, e)}
                className="w-full aspect-video"
                poster="/placeholder.svg?height=480&width=854"
              />
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium text-gray-700">Watching Progress</Label>
                {progress?.isCompleted && (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
                  </span>
                )}
              </div>
              <Progress value={progress?.isCompleted ? 100 : watchProgress} className="mt-2 h-2.5 bg-gray-100" />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{progress?.isCompleted ? 100 : watchProgress}% watched</span>
                {!progress?.isCompleted && (
                  <span>
                    {progress?.watchedDuration || 0}s / {progress?.totalDuration || 0}s
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={navigateToNextTask}
                variant="default"
                className="ml-auto group"
                disabled={!progress?.isCompleted}
              >
                {progress?.isCompleted ? "Continue to Next" : "Complete Video to Continue"}
                {progress?.isCompleted && (
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )

    case "Quiz":
      const quizTips = [
        "Read each question carefully before selecting an answer",
        "Eliminate obviously incorrect options first",
        "Review related lesson content if you're unsure",
        "Take your time - accuracy is more important than speed",
      ]

      return (
        <Card className="shadow-lg border-blue-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="bg-blue-100 p-1.5 rounded-full shadow-sm">
                <FileText className="text-blue-600 h-5 w-5" />
              </div>
              Knowledge Check
            </CardTitle>
            <CardDescription className="text-gray-600">Test your understanding of the material</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <TipCard title="Quiz Tips" tips={quizTips} variant="warning" className="mb-6" />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-6 text-gray-800">
                {selectedTask.Question || "Complete the quiz below"}
              </h3>
              {selectedTask.Question && (
                <RadioGroup onValueChange={(value) => handleQuizAnswer(value)} className="space-y-3">
                  {shuffledOptions &&
                    shuffledOptions.map((option: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 border p-4 rounded-md hover:bg-blue-50/50 transition-colors"
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} className="h-5 w-5 text-blue-600" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700">
                          {option}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => submitQuiz(selectedTask._id, course._id)}
                disabled={submitting || !quizAnswers}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )

    case "Assignment":
      // Check if there's a previous submission
      const previousSubmission = findTaskSubmissionData(selectedTask._id)
      const isTaskCompleted = taskProgress[selectedTask._id]?.isCompleted

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
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Assignment Instructions</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedTask.Description ||
                  selectedTask.description ||
                  "Complete the assignment based on what you've learned."}
              </p>
            </div>

            {/* Tips section */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
              <h4 className="text-sm font-semibold flex items-center text-blue-700 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
                <li>Don't hesitate to use the "Chat with Mentor" feature if you need help</li>
              </ul>
            </div>

            {/* Previous submission section */}
            {isTaskCompleted && previousSubmission && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Your Previous Submission</h4>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                  </Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 text-sm">
                  <pre className="whitespace-pre-wrap font-sans">{previousSubmission}</pre>
                </div>
              </div>
            )}

            {/* Solution input area */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="assignment"
                  className="text-sm font-medium text-gray-700 flex items-center justify-between"
                >
                  <span>Your Solution</span>
                  {isTaskCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => previousSubmission && setAssignmentSubmission(previousSubmission)}
                    >
                      Edit Previous Submission
                    </Button>
                  )}
                </Label>
                <textarea
                  id="assignment"
                  value={assignmentSubmission}
                  onChange={(e) => {
                    setAssignmentSubmission(e.target.value)
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
                  {assignmentSubmission.length > 0 ? `${assignmentSubmission.length} characters` : "No content yet"}
                </div>
                <Button
                  onClick={() => submitAssignment(selectedTask._id)}
                  disabled={submitting || !assignmentSubmission.trim()}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? "Submitting..." : isTaskCompleted ? "Update Submission" : "Submit Assignment"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )

    default:
      return (
        <Card className="flex items-center justify-center h-full">
          <CardContent className="text-center p-6">
            <BookOpen className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
            <p>Content type not supported</p>
          </CardContent>
        </Card>
      )
  }
}

export default CourseContent

"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import CourseSidebar from "./course-sidebar"
import CourseContent from "./course-content"
import MeetingDialog from "./meeting-dialog"
import { getSelectedCourse, getProgress, requestmeeting, startChat } from "@/services/fetchdata"
import { Course, Task, Meeting, TaskProgress } from "@/type/course"
import CourseRatingComponent from "@/components/courses/review"
// import type { Course, Task, Meeting, TaskProgress } from "@/types/course"

const CourseViewContainer = ({ id }: { id: string }) => {
  const [meet, setMeet] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [taskProgress, setTaskProgress] = useState<{
    [key: string]: TaskProgress
  }>({})
  const [selectedlessonid, setLesson] = useState("")
  const [totalprogres, settotalprogress] = useState<number | null>(null)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const router = useRouter()

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true)

      try {
        const data = await getSelectedCourse(id)
        setCourse(data.data.data)
        setMeet(data.meet ? { ...data.meet, meetingTime: data.meet.scheduledTime } : data.meet)

        // Initialize task progress
        const initialProgress: { [key: string]: TaskProgress } = {}

        const progressData = await getProgress(id)
        settotalprogress(progressData.data.OverallScore)

        // Map the lesson progress data to our task progress state
        if (progressData.data && progressData.data.lesson_progress) {
          progressData.data.lesson_progress.forEach((lessonProgress: any) => {
            // For each lesson in the progress data
            if (lessonProgress.Lesson_id) {
              // Add an entry for the lesson
              initialProgress[lessonProgress.Lesson_id._id] = {
                id: lessonProgress.Lesson_id._id,
                watchedDuration: lessonProgress.WatchTime || 0,
                totalDuration: lessonProgress.WatchTime || 0,
                isCompleted: lessonProgress.Completed || false,
              }

              // Process task progress within each lesson
              if (lessonProgress.Task_progress && lessonProgress.Task_progress.length > 0) {
                lessonProgress.Task_progress.forEach((taskProgress: any) => {
                  initialProgress[taskProgress.Task_id] = {
                    id: taskProgress.Task_id,
                    watchedDuration: 0,
                    totalDuration: 0,
                    isCompleted: taskProgress.Completed || taskProgress.Status === "Completed",
                    submissionData: taskProgress.response || " ",
                  }
                })
              }
            }
          })
        }

        setTaskProgress(initialProgress)

        // Select first task by default
        if (data.data.data.lessons.length > 0 && data.data.data.lessons[0].Task.length > 0) {
          setSelectedTask(data.data.data.lessons[0].Task[0])
          setLesson(data.data.data.lessons[0]._id)
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        toast.error("Failed to load course content")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [id])

  const handleChatmentor = async () => {
    if (!course) return

    try {
      const roomid = await startChat(String(course._id))
      router.push("/course/chat/" + roomid)
    } catch (error) {
      console.error("Error starting chat:", error)
      toast.error("Failed to start chat with mentor")
    }
  }

  const handleRequestMeeting = async (date: string, time: string) => {
    if (!course) return

    try {
      // Create a datetime string from the selected date and time
      const meetingDateTime = new Date(`${date}T${time}:00`)

      const result = await requestmeeting(course.Mentor_id.mentorId, meetingDateTime.toString(), course._id)

      // Update meeting state with the new meeting
      setMeet({
        _id: "2412341232345",
        meetingTime: meetingDateTime.toString(),
        status: "Pending",
      })

      toast.success(`Meeting scheduled for ${meetingDateTime.toLocaleString()}`)
      setMeetingDialogOpen(false)
      return true
    } catch (error) {
      console.error("Error requesting meeting:", error)
      toast.error("Failed to schedule meeting. Please try again.")
      return false
    }
  }

  // Join meeting handler
  const handleJoinMeeting = () => {
    if (meet?.meetingLink) {
      window.open(meet.meetingLink, "_blank")
    } else {
      toast.error("Meeting link is not yet available")
    }
  }

  // Navigate to next task
  const navigateToNextTask = () => {
    if (!course || !selectedTask) return

    // Find current lesson and task
    let currentLessonIdx = -1
    let currentTaskIdx = -1

    for (let i = 0; i < course.lessons.length; i++) {
      const taskIndex = course.lessons[i].Task.findIndex((task) => task._id === selectedTask._id)
      if (taskIndex !== -1) {
        currentLessonIdx = i
        currentTaskIdx = taskIndex
        break
      }
    }

    if (currentLessonIdx === -1 || currentTaskIdx === -1) return

    // Check if there's another task in current lesson
    if (currentTaskIdx < course.lessons[currentLessonIdx].Task.length - 1) {
      setSelectedTask(course.lessons[currentLessonIdx].Task[currentTaskIdx + 1])
    }
    // Move to next lesson
    else if (currentLessonIdx < course.lessons.length - 1) {
      if (course.lessons[currentLessonIdx + 1].Task.length > 0) {
        setCurrentLessonIndex(currentLessonIdx + 1)
        setSelectedTask(course.lessons[currentLessonIdx + 1].Task[0])
        setLesson(course.lessons[currentLessonIdx + 1]._id)
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading course content...</p>
        </div>
      </div>
    )
  }

  // No course found
  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-8 max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested course could not be found or has been removed.</p>
          <Button onClick={() => router.push("/courses")}>Return to Courses</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Left side - Course details and lessons */}
        <CourseSidebar
          course={course}
          meet={meet}
          taskProgress={taskProgress}
          currentLessonIndex={currentLessonIndex}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          setLesson={setLesson}
          totalProgress={totalprogres || 0}
          onChatWithMentor={handleChatmentor}
          onRequestMeeting={() => setMeetingDialogOpen(true)}
          onJoinMeeting={handleJoinMeeting}
        />

        {/* Right side - Task content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="sticky top-8 max-h-[90vh] overflow-y-auto rounded-lg">
            <CourseContent
              course={course}
              selectedTask={selectedTask}
              taskProgress={taskProgress}
              setTaskProgress={setTaskProgress}
              selectedlessonid={selectedlessonid}
              navigateToNextTask={navigateToNextTask}
              settotalprogress={settotalprogress}
            />
          </div>
        </div>
      </div>

      {/* Meeting Request Dialog */}
      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        onRequestMeeting={handleRequestMeeting}
      />
      <CourseRatingComponent courseid={course._id} />
    </div>
  )
}

export default CourseViewContainer

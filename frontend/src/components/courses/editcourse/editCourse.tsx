"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2 } from "lucide-react"
import type { ILesson, ICourses, IQuizTask, IAssignmentTask, IVideoTask } from "@/services/interface/CourseDto"
import { deleteLessonApi, savelessonchanges } from "@/services/fetchdata"
import { toast } from "sonner"
import CourseSidebar from "./course-sidebar"
import LessonDetailsForm from "./lesson-details-form"
import TasksManager from "./tasks-manager"

interface EditLessonDialogProps {
  isOpen: boolean
  onClose: () => void
  lesson: ILesson | null
  course: ICourses | null
  onSave: (updatedLesson: ILesson) => Promise<void>
  courses: ICourses[]
  setCourses: any
}

const EditLessonDialog = ({ isOpen, onClose, lesson, course, onSave, courses, setCourses }: EditLessonDialogProps) => {
  const [updatedLesson, setUpdatedLesson] = useState<ILesson | null>(null)
  const [updateLesson, setUpdatLessons] = useState<ILesson | null>(null)
  const [tasks, setTasks] = useState<(IQuizTask | IAssignmentTask | IVideoTask)[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState(false)

  // Initialize the form with lesson data when it changes
  useEffect(() => {
    if (lesson) {
      setUpdatedLesson({ ...lesson })
      setTasks(lesson.Task)
    }
  }, [lesson])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!updatedLesson) return

    setUpdatedLesson({
      ...updatedLesson,
      [e.target.name]: e.target.value,
    })
    setUpdatLessons((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = async () => {
    if (!updatedLesson) return

    setIsLoading(true)
    try {
      if (updateLesson) {
        await savelessonchanges(lesson?._id, updateLesson, course?._id)
        setUpdatLessons(null)
      }
      await onSave(updatedLesson)
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLesson = async () => {
    try {
      setIsLoading(true)
      await deleteLessonApi(course?._id, lesson?._id)
      toast.success("Lesson deleted successfully")
      const idex = courses.findIndex((couse) => couse._id == course?._id)
      setCourses((prev) => prev.filter((_, i) => i !== idex))
      onClose()
    } catch (error) {
      toast.error("Unexpected error occurred while deleting lesson")
    } finally {
      setIsLoading(false)
    }
  }

  if (!updatedLesson || !course) return null

  const isApproved = course.Approved_by_admin === "approved"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-blue-950 text-white border-blue-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-blue-100 flex items-center gap-2">
            {isApproved ? "View Lesson" : "Edit Lesson"}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            {isApproved ? "View lesson details and content" : "Make changes to lesson content and tasks"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Left sidebar - Course info */}
          <CourseSidebar course={course} updatedLesson={updatedLesson} />

          {/* Main content area */}
          <div className="md:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-900 border-none">
                <TabsTrigger
                  value="details"
                  className="text-blue-300 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Lesson Details
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="text-blue-300 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Tasks & Assignments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-4">
                <LessonDetailsForm
                  updatedLesson={updatedLesson}
                  handleInputChange={handleInputChange}
                  isApproved={isApproved}
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-4 space-y-6">
                <TasksManager
                  tasks={tasks}
                  setTasks={setTasks}
                  lessonId={updatedLesson._id}
                  courseId={course._id}
                  isApproved={isApproved}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className={`text-red-400 border-red-800 hover:bg-red-900 hover:text-red-200 flex items-center gap-1 ${
                  isApproved ? "hidden" : ""
                }`}
                onClick={handleDeleteLesson}
              >
                <Trash2 size={16} />
                <span>Delete Lesson</span>
              </Button>
              <Button
                variant="outline"
                className="bg-blue-900 border-blue-700 text-blue-200 hover:bg-blue-800"
                onClick={onClose}
              >
                {isApproved ? "Close" : "Cancel"}
              </Button>
              {!isApproved && (
                <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditLessonDialog

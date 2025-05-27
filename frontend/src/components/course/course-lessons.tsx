"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Edit, FileQuestion, FileText, ImageIcon, MoreVertical, Plus, Trash2, Video } from "lucide-react"
import LessonForm from "./lesson-form"
import TaskForm from "./task-form"

interface CourseLessonsProps {
  lessons: any[]
  updateLessons: (lessons: any[]) => void
}

const CourseLessons = ({ lessons, updateLessons }: CourseLessonsProps) => {
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null)
  const [currentTaskType, setCurrentTaskType] = useState("Quiz")
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null)

  // Add new lesson
  const addNewLesson = () => {
    setCurrentLessonIndex(null)
    setShowLessonModal(true)
  }

  // Edit existing lesson
  const editLesson = (index: number) => {
    setCurrentLessonIndex(index)
    setShowLessonModal(true)
  }

  // Save lesson data
  const saveLesson = (lessonData: any) => {
    const updatedLessons = [...lessons]

    if (currentLessonIndex !== null) {
      // Preserve existing tasks when editing
      const existingTasks = updatedLessons[currentLessonIndex]?.Task || []
      updatedLessons[currentLessonIndex] = {
        ...lessonData,
        Task: existingTasks,
      }
    } else {
      updatedLessons.push({
        ...lessonData,
        Task: [],
      })
    }

    updateLessons(updatedLessons)
    setShowLessonModal(false)
  }

  // Delete lesson
  const deleteLesson = (index: number) => {
    const updatedLessons = [...lessons]
    updatedLessons.splice(index, 1)
    updateLessons(updatedLessons)
  }

  // Add new task
  const addNewTask = (lessonIndex: number, type: string) => {
    setCurrentLessonIndex(lessonIndex)
    setCurrentTaskType(type)
    setCurrentTaskIndex(null)
    setShowTaskModal(true)
  }

  // Edit existing task
  const editTask = (lessonIndex: number, taskIndex: number) => {
    const task = lessons[lessonIndex].Task[taskIndex]
    setCurrentLessonIndex(lessonIndex)
    setCurrentTaskIndex(taskIndex)
    setCurrentTaskType(task.Type)
    setShowTaskModal(true)
  }

  // Save task data
  const saveTask = (taskData: any) => {
    if (currentLessonIndex === null) return

    const updatedLessons = [...lessons]
    const currentLesson = { ...updatedLessons[currentLessonIndex] }

    if (!currentLesson.Task) {
      currentLesson.Task = []
    }

    if (currentTaskIndex !== null) {
      currentLesson.Task[currentTaskIndex] = taskData
    } else {
      currentLesson.Task.push(taskData)
    }

    updatedLessons[currentLessonIndex] = currentLesson
    updateLessons(updatedLessons)
    setShowTaskModal(false)
  }

  // Delete task
  const deleteTask = (lessonIndex: number, taskIndex: number) => {
    const updatedLessons = [...lessons]
    updatedLessons[lessonIndex].Task.splice(taskIndex, 1)
    updateLessons(updatedLessons)
  }

  // Helper function to get task icon based on type
  const getTaskIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "quiz":
        return <FileQuestion className="mr-2 h-4 w-4" />
      case "assignment":
        return <FileText className="mr-2 h-4 w-4" />
      case "video":
        return <Video className="mr-2 h-4 w-4" />
      default:
        return <FileText className="mr-2 h-4 w-4" />
    }
  }

  // Helper function to get task description
  const getTaskDescription = (task: any) => {
    const type = task.Type.toLowerCase()
    if (type === "quiz") {
      return "Question: " + (task.Question || "No question added")
    } else if (type === "assignment") {
      return task.Description?.substring(0, 50) + (task.Description?.length > 50 ? "..." : "") || "No description added"
    } else if (type === "video") {
      return task.VideoURL ? "Video uploaded to S3" : "No video added"
    }
    return ""
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-blue-800">Course Lessons</h3>
        <Button onClick={addNewLesson} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
          <ImageIcon className="mx-auto h-12 w-12 text-blue-300" />
          <p className="text-blue-600 mt-4">No lessons added yet. Click "Add Lesson" to get started.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {lessons.map((lesson, lessonIndex) => (
            <AccordionItem
              key={lessonIndex}
              value={`lesson-${lessonIndex}`}
              className="border border-blue-100 rounded-md mb-2 overflow-hidden"
            >
              <div className="flex items-center justify-between bg-blue-50 hover:bg-blue-100">
                <AccordionTrigger className="text-left text-blue-700 px-4 py-2 hover:no-underline hover:text-blue-800">
                  {lesson.Lessone_name || `Lesson ${lessonIndex + 1}`}
                </AccordionTrigger>
                <div className="flex mr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-200">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => editLesson(lessonIndex)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit Lesson
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteLesson(lessonIndex)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Lesson
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <AccordionContent className="bg-white">
                <div className="pl-4 border-l-2 border-blue-200 ml-2 mt-2">
                  <div className="mb-4">
                    <p className="text-sm text-blue-500">Lesson Content:</p>
                    <p className="text-sm">{lesson.Content || "No content added"}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-blue-700">Tasks</h4>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addNewTask(lessonIndex, "Quiz")}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <FileQuestion className="mr-2 h-4 w-4" /> Add Quiz
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addNewTask(lessonIndex, "Assignment")}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <FileText className="mr-2 h-4 w-4" /> Add Assignment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addNewTask(lessonIndex, "Video")}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Video className="mr-2 h-4 w-4" /> Add Video
                        </Button>
                      </div>
                    </div>

                    {lesson.Task && lesson.Task.length > 0 ? (
                      <div className="space-y-2">
                        {lesson.Task.map((task, taskIndex) => (
                          <div
                            key={taskIndex}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors border border-blue-100"
                          >
                            <div className="flex items-center">
                              {getTaskIcon(task.Type)}
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-blue-800">{task.Type}</span>
                                  <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                                    {task.Type}
                                  </Badge>
                                  {task.VideoURL && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 bg-green-100 text-green-800 border-green-300"
                                    >
                                      S3 Uploaded
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-blue-600">{getTaskDescription(task)}</p>
                              </div>
                            </div>
                            <div className="flex">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editTask(lessonIndex, taskIndex)}
                                className="text-blue-600 hover:bg-blue-200"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(lessonIndex, taskIndex)}
                                className="text-red-500 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-blue-400 italic bg-blue-50 p-4 rounded-md">
                        No tasks added to this lesson yet.
                      </p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Lesson Form Modal */}
      <LessonForm
        open={showLessonModal}
        onOpenChange={setShowLessonModal}
        lessonData={currentLessonIndex !== null ? lessons[currentLessonIndex] : null}
        onSave={saveLesson}
      />

      {/* Task Form Modal */}
      <TaskForm
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        taskType={currentTaskType}
        taskData={
          currentLessonIndex !== null && currentTaskIndex !== null
            ? lessons[currentLessonIndex].Task[currentTaskIndex]
            : null
        }
        onSave={saveTask}
      />
    </>
  )
}

export default CourseLessons


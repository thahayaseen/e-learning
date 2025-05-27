"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"
import { addNewTaskDb, deleteTask } from "@/services/fetchdata"
import type { IQuizTask, IAssignmentTask, IVideoTask } from "@/services/interface/CourseDto"
import TaskItem from "./task-item"
import NewTaskForm from "./new-task-form"

interface TasksManagerProps {
  tasks: (IQuizTask | IAssignmentTask | IVideoTask)[]
  setTasks: React.Dispatch<React.SetStateAction<(IQuizTask | IAssignmentTask | IVideoTask)[]>>
  lessonId: string
  courseId: string
  isApproved: boolean
}

const TasksManager = ({ tasks, setTasks, lessonId, courseId, isApproved }: TasksManagerProps) => {
  const [newTask, setNewTask] = useState<{
    Type: "Quiz" | "Assignment" | "Video"
    content: string
    options?: string[]
    answer?: string
    videoURL?: string
  }>({
    Type: "Assignment",
    content: "",
    options: ["", "", "", ""],
    answer: "",
    videoURL: "",
  })

  const addNewTask = async () => {
    let taskToAdd: IQuizTask | IAssignmentTask | IVideoTask

    if (newTask.Type === "Quiz") {
      taskToAdd = {
        Type: "Quiz",
        Lesson_id: lessonId,
        Question: newTask.content,
        Options: newTask.options || ["", "", "", ""],
        Answer: newTask.answer || "",
      }
    } else if (newTask.Type === "Assignment") {
      taskToAdd = {
        Type: "Assignment",
        Lesson_id: lessonId,
        Description: newTask.content,
      }
    } else {
      taskToAdd = {
        Type: "Video",
        Lesson_id: lessonId,
        VideoURL: newTask.videoURL || "",
      }
    }

    try {
      await addNewTaskDb(taskToAdd, lessonId, courseId)
      setTasks([...tasks, taskToAdd])

      // Reset the new task form
      setNewTask({
        Type: "Assignment",
        content: "",
        options: ["", "", "", ""],
        answer: "",
        videoURL: "",
      })

      toast.success("Task added successfully")
    } catch (error) {
      toast.error("Failed to add task")
    }
  }

  const removeTask = async (index: number, taskId: string) => {
    try {
      await deleteTask(taskId, lessonId, courseId)

      const updatedTasks = [...tasks]
      updatedTasks.splice(index, 1)
      setTasks(updatedTasks)

      toast.success("Task removed successfully")
    } catch (error) {
      toast.error("Failed to remove task")
    }
  }

  return (
    <>
      <div className="bg-blue-900 border border-blue-800 rounded-md p-4">
        <h3 className="text-lg font-medium text-blue-100 mb-4">Current Tasks</h3>

        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <TaskItem
                key={index}
                task={task}
                index={index}
                isApproved={isApproved}
                onRemove={() => removeTask(index, task._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-blue-300">No tasks have been added to this lesson yet.</div>
        )}
      </div>

      {!isApproved && <NewTaskForm newTask={newTask} setNewTask={setNewTask} onAddTask={addNewTask} />}
    </>
  )
}

export default TasksManager

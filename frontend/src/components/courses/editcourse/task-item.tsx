"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import type { IQuizTask, IAssignmentTask, IVideoTask } from "@/services/interface/CourseDto"
import QuizOption from "./quiz-option"

interface TaskItemProps {
  task: IQuizTask | IAssignmentTask | IVideoTask
  index: number
  isApproved: boolean
  onRemove: () => void
}

const TaskItem = ({ task, index, isApproved, onRemove }: TaskItemProps) => {
  return (
    <Card className="bg-blue-900 border-blue-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-md text-blue-100 flex items-center gap-2">
          {task.Type === "Quiz" && "Quiz Question"}
          {task.Type === "Assignment" && "Assignment"}
          {task.Type === "Video" && "Video Content"}
          <Badge className="bg-blue-800 text-blue-200 text-xs">{task.Type}</Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className={`text-blue-300 hover:text-red-300 hover:bg-blue-800 ${isApproved ? "hidden" : ""}`}
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.Type === "Quiz" && (
          <>
            <div className="space-y-2">
              <Label className="text-blue-200">Question</Label>
              <Input
                value={(task as IQuizTask).Question}
                disabled={true}
                className="bg-blue-800 border-blue-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">Options</Label>
              <div className="grid grid-cols-1 gap-2">
                {(task as IQuizTask).Options.map((option, optionIndex) => (
                  <QuizOption
                    key={optionIndex}
                    option={option}
                    optionIndex={optionIndex}
                    isCorrectAnswer={(task as IQuizTask).Answer === option}
                    isDisabled={true}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">Correct Answer</Label>
              <Input
                disabled={true}
                value={(task as IQuizTask).Answer}
                className="bg-blue-800 border-blue-700 text-white"
              />
            </div>
          </>
        )}

        {task.Type === "Assignment" && (
          <div className="space-y-2">
            <Label className="text-blue-200">Assignment Description</Label>
            <Textarea
              value={(task as IAssignmentTask).Description}
              disabled={true}
              className="bg-blue-800 border-blue-700 text-white"
              rows={4}
            />
          </div>
        )}

        {task.Type === "Video" && (
          <div className="space-y-2">
            <Label className="text-blue-200">Video URL</Label>
            <Input
              disabled={isApproved}
              value={(task as IVideoTask).VideoURL}
              className="bg-blue-800 border-blue-700 text-white"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TaskItem

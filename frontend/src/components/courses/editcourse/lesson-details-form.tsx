"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ILesson } from "@/services/interface/CourseDto"

interface LessonDetailsFormProps {
  updatedLesson: ILesson
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  isApproved: boolean
}

const LessonDetailsForm = ({ updatedLesson, handleInputChange, isApproved }: LessonDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="Lessone_name" className="text-blue-200">
          Lesson Name
        </Label>
        <Input
          id="Lessone_name"
          name="Lessone_name"
          disabled={isApproved}
          value={updatedLesson.Lessone_name || ""}
          onChange={handleInputChange}
          className="bg-blue-900 border-blue-700 text-white focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="Content" className="text-blue-200">
          Lesson Content
        </Label>
        <Textarea
          id="Content"
          name="Content"
          disabled={isApproved}
          value={updatedLesson.Content || ""}
          onChange={handleInputChange}
          rows={12}
          className="bg-blue-900 border-blue-700 text-white focus:border-blue-500"
        />
      </div>
    </div>
  )
}

export default LessonDetailsForm

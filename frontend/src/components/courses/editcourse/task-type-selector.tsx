"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FileText, MessageSquare, Video } from "lucide-react"

interface TaskTypeSelectorProps {
  selectedType: "Quiz" | "Assignment" | "Video"
  onChange: (type: "Quiz" | "Assignment" | "Video") => void
}

const TaskTypeSelector = ({ selectedType, onChange }: TaskTypeSelectorProps) => {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={() => onChange("Quiz")}
        className={cn(
          "flex-1 transition-all",
          selectedType === "Quiz"
            ? "bg-blue-600 hover:bg-blue-500 border-blue-500"
            : "bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700",
        )}
      >
        <MessageSquare size={16} className="mr-2" />
        Quiz
      </Button>
      <Button
        type="button"
        onClick={() => onChange("Assignment")}
        className={cn(
          "flex-1 transition-all",
          selectedType === "Assignment"
            ? "bg-blue-600 hover:bg-blue-500 border-blue-500"
            : "bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700",
        )}
      >
        <FileText size={16} className="mr-2" />
        Assignment
      </Button>
      <Button
        type="button"
        onClick={() => onChange("Video")}
        className={cn(
          "flex-1 transition-all",
          selectedType === "Video"
            ? "bg-blue-600 hover:bg-blue-500 border-blue-500"
            : "bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700",
        )}
      >
        <Video size={16} className="mr-2" />
        Video
      </Button>
    </div>
  )
}

export default TaskTypeSelector

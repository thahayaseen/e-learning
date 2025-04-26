"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuizOptionProps {
  option: string
  optionIndex: number
  isCorrectAnswer: boolean
  isDisabled: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const QuizOption = ({ option, optionIndex, isCorrectAnswer, isDisabled, onChange }: QuizOptionProps) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors",
          isCorrectAnswer
            ? "bg-green-700 text-green-100 ring-2 ring-green-500 ring-opacity-50"
            : "bg-blue-800 text-blue-100",
        )}
      >
        {String.fromCharCode(65 + optionIndex)}
      </div>
      <Input
        value={option}
        onChange={onChange}
        disabled={isDisabled}
        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
        className={cn(
          "transition-all",
          isCorrectAnswer
            ? "bg-blue-800/70 border-green-700 text-white ring-1 ring-green-600"
            : "bg-blue-800 border-blue-700 text-white",
        )}
      />
    </div>
  )
}

export default QuizOption

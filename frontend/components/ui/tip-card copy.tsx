"use client"

import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"

interface TipCardProps {
  title: string
  tips: string[]
  variant?: "info" | "warning" | "success" | "error"
  className?: string
  onClose?: () => void
}

export const TipCard = ({ title, tips, variant = "info", className = "", onClose }: TipCardProps) => {
  // Define variant-specific styles
  const variantStyles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      title: "text-blue-700",
      icon: "text-blue-500",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      title: "text-amber-700",
      icon: "text-amber-500",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-100",
      title: "text-green-700",
      icon: "text-green-500",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-100",
      title: "text-red-700",
      icon: "text-red-500",
    },
  }

  const style = variantStyles[variant]

  return (
    <Card className={`${style.bg} ${style.border} shadow-sm ${className}`}>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className={`text-sm font-medium ${style.title}`}>{title}</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 rounded-full">
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <ul className="space-y-1 text-xs">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className={`mr-1.5 ${style.title}`}>•</span>
              <span className={`${style.title}`}>{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

"use client"

import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Edit, Users } from "lucide-react"
import type { ICourses } from "@/services/interface/CourseDto"

interface CourseCardProps {
  course: ICourses
  onEdit: () => void
}

export default function CourseCard({ course, onEdit }: CourseCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow bg-blue-900 border-blue-800">
      <div className="relative h-48 w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-600 flex items-center justify-center">
          {course.image ? (
            <Image
              src={course.image || "/placeholder.svg"}
              alt={course.Title || "Course image"}
              fill
              className="object-cover"
            />
          ) : (
            <BookOpen size={48} className="text-blue-300 opacity-70" />
          )}
        </div>
        {course.Approved_by_admin === "approved" ? (
          <Badge className="absolute top-2 right-2 bg-green-500">Approved</Badge>
        ) : (
          <Badge className="absolute top-2 right-2 bg-amber-500">{course.Approved_by_admin}</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1 text-xl text-white">{course.Title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-blue-300">
          <Clock size={16} />
          {formatDate(course.CreatedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-2 text-blue-100 mb-2">{course.Description}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <Users size={16} />
            <span>{course.Students_enrolled?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <BookOpen size={16} />
            <span>{course.lessons?.length || 0}</span>
          </div>
          <div className="text-sm font-semibold text-blue-100">₹{course.Price?.toFixed(2) || "0.00"}</div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-blue-800 pt-4">
        <Button className="w-full bg-blue-700 hover:bg-blue-600 text-white" onClick={onEdit}>
          <Edit size={16} className="mr-2" /> Edit Course
        </Button>
      </CardFooter>
    </Card>
  )
}

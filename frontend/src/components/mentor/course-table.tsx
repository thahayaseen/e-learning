"use client"

import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Edit, Trash2 } from "lucide-react"
import type { ICourses } from "@/services/interface/CourseDto"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface CourseTableProps {
  courses: ICourses[]
  onEdit: (course: ICourses) => void
  onDelete: (courseId: string) => void
}

export default function CourseTable({ courses, onEdit, onDelete }: CourseTableProps) {
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
useEffect(()=>{
  console.log("couse updated",courses);
  
},[courses])
  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId)
  }

  const confirmDelete = () => {
    if (courseToDelete) {
      onDelete(courseToDelete)
      setCourseToDelete(null)
    }
  }

  return (
    <Card className="bg-blue-900 border-blue-800 shadow-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-blue-800">
          <TableRow className="border-blue-700 hover:bg-blue-800">
            <TableHead className="font-semibold text-blue-100">Course Title</TableHead>
            <TableHead className="font-semibold text-blue-100">Category</TableHead>
            <TableHead className="font-semibold text-blue-100">Created</TableHead>
            <TableHead className="font-semibold text-blue-100">Students</TableHead>
            <TableHead className="font-semibold text-blue-100">Price</TableHead>
            <TableHead className="font-semibold text-blue-100">Status</TableHead>
            <TableHead className="font-semibold text-blue-100 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course._id} className="border-blue-800 hover:bg-blue-800">
              <TableCell className="font-medium text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded overflow-hidden bg-blue-700 flex items-center justify-center">
                    <BookOpen size={20} className="text-blue-300" />
                  </div>
                  <span className="line-clamp-1">{course.Title}</span>
                </div>
              </TableCell>
              <TableCell className="text-blue-200">{course.Category?.Category || "Uncategorized"}</TableCell>
              <TableCell className="text-blue-200">{formatDate(course.CreatedAt)}</TableCell>
              <TableCell className="text-blue-200">{course.Students_enrolled?.length || 0}</TableCell>
              <TableCell className="text-blue-200">₹{course.Price?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>
                {course.Approved_by_admin === "approved" ? (
                  <Badge className="bg-green-600 text-white">Approved</Badge>
                ) : (
                  <Badge className="bg-amber-600 text-white">{course.Approved_by_admin}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white" onClick={() => onEdit(course)}>
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>

                  <AlertDialog
                    open={courseToDelete === course._id}
                    onOpenChange={(open) => {
                      if (!open) setCourseToDelete(null)
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(course._id)}>
                        <Trash2 size={16} className="mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-blue-900 text-white border-blue-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription className="text-blue-300">
                          Are you sure you want to delete this course? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-blue-800 text-white border-blue-700 hover:bg-blue-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

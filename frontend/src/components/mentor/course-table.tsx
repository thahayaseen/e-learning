"use client";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Edit, EyeOff, Eye, FileText } from "lucide-react";
import type { ICourses } from "@/services/interface/CourseDto";
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
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface CourseTableProps {
  courses: ICourses[];
  onEdit: (course: ICourses) => void;
  onAction: (courseId: string) => void;
}

export default function CourseTable({
  courses,
  onEdit,
  onAction,
}: CourseTableProps) {
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  
  useEffect(() => {
   }, [courses]);
  
  const handleVisibilityClick = (courseId: string) => {
    setCourseToDelete(courseId);
  };

  const confirmAction = () => {
    if (courseToDelete) {
      onAction(courseToDelete);
      setCourseToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-3 py-1">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-500 hover:bg-slate-600 text-white font-medium px-3 py-1">{status}</Badge>;
    }
  };

  return (
    <Card className="border-gray-500 shadow-lg overflow-hidden bg-gradient-to-b from-blue-950 to-cyan-950">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-cyan-900 border-b border-sky-700 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-2xl font-bold">Course Management</CardTitle>
            <CardDescription className="text-sky-200 mt-1">Manage your courses and their visibility</CardDescription>
          </div>
          <div className="bg-sky-800 p-2 rounded-full">
            <FileText size={24} className="text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-sky-950 to-cyan-950">
              <TableRow className="hover:bg-sky-900 border-b border-sky-800">
                <TableHead className="font-bold text-white py-4">Course Title</TableHead>
                <TableHead className="font-bold text-white">Category</TableHead>
                <TableHead className="font-bold text-white">Created</TableHead>
                <TableHead className="font-bold text-white">Students</TableHead>
                <TableHead className="font-bold text-white">Price</TableHead>
                <TableHead className="font-bold text-white">Status</TableHead>
                <TableHead className="font-bold text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow
                  key={course._id}
                  className={`border-b border-cyan-900 transition-colors duration-200 ${
                    course.unlist 
                      ? "bg-opacity-50 bg-sky-950 text-slate-400" 
                      : "hover:bg-cyan-900/50 text-white"
                  }`}
                >
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg overflow-hidden ${course.unlist ? "bg-slate-700" : "bg-sky-700"} flex items-center justify-center shadow-md`}>
                        <BookOpen size={20} className="text-white" />
                      </div>
                      <span className="line-clamp-1 font-medium">{course.Title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-sky-800 bg-opacity-40 text-sm">
                      {course.Category?.Category || "Uncategorized"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDate(course.CreatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{course.Students_enrolled?.length || 0}</span>
                      <span className="text-sm text-sky-300">enrolled</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">₹{course.Price?.toFixed(2) || "0.00"}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(course.Approved_by_admin)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-sky-600 hover:bg-sky-800 text-white transition-colors duration-150"
                        onClick={() => onEdit(course)}
                      >
                        <Edit size={16} className="mr-1" /> Edit
                      </Button>

                      <AlertDialog
                        open={courseToDelete === course._id}
                        onOpenChange={(open) => {
                          if (!open) setCourseToDelete(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant={course.unlist ? "outline" : "secondary"}
                            className={course.unlist 
                              ? "border-green-500 hover:bg-green-800 hover:border-green-400 text-green-400 transition-colors duration-150" 
                              : "bg-cyan-800 hover:bg-cyan-700 text-white transition-colors duration-150"}
                            onClick={() => handleVisibilityClick(course._id)}
                          >
                            {course.unlist ? (
                              <>
                                <Eye size={16} className="mr-1" /> List Course
                              </>
                            ) : (
                              <>
                                <EyeOff size={16} className="mr-1" /> Unlist
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gradient-to-b from-blue-900 to-cyan-900 border-sky-700 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-white">
                              {course.unlist ? "List Course" : "Unlist Course"}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sky-200">
                              Are you sure you want to {course.unlist ? "list" : "unlist"} this course? 
                              {course.unlist 
                                ? " This will make the course visible to students."
                                : " This will hide the course from students."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-sky-600 hover:bg-sky-800 text-white">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className={course.unlist 
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-cyan-700 hover:bg-cyan-800 text-white"}
                              onClick={confirmAction}
                            >
                              {course.unlist ? "List Course" : "Unlist Course"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-sky-200">
                    <div className="flex flex-col items-center gap-3">
                      <BookOpen size={48} className="text-sky-700 opacity-50" />
                      <p>No courses found. Create your first course to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
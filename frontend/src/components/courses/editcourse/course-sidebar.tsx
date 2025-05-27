import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle } from "lucide-react"
import type { ICourses, ILesson } from "@/services/interface/CourseDto"

interface CourseSidebarProps {
  course: ICourses
  updatedLesson: ILesson
}

const CourseSidebar = ({ course, updatedLesson }: CourseSidebarProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-blue-900 border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-100 flex items-center gap-2">
            Course Details
            <Badge className="ml-2 bg-blue-800 text-blue-200">{course.Title}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-blue-300 text-sm">Course Title</Label>
            <div className="text-white font-medium">{course.Title}</div>
          </div>

          <div>
            <Label className="text-blue-300 text-sm">Category</Label>
            <div className="text-white">{course.Category?.Category || "Uncategorized"}</div>
          </div>

          <div>
            <Label className="text-blue-300 text-sm">Status</Label>
            <div>
              {course.Approved_by_admin === "approved" ? (
                <Badge className="bg-green-900 text-green-100 flex items-center gap-1 mt-1">
                  <CheckCircle size={12} /> Approved
                </Badge>
              ) : (
                <Badge className="bg-amber-900 text-amber-100 mt-1">{course.Approved_by_admin}</Badge>
              )}
            </div>
          </div>

          <div>
            <Label className="text-blue-300 text-sm">Total Lessons</Label>
            <div className="text-white">{course.lessons?.length || 0}</div>
          </div>

          <Separator className="bg-blue-800" />

          <div className="text-sm text-blue-300">
            Editing lesson {course.lessons?.indexOf(updatedLesson._id) + 1 || "?"} of {course.lessons?.length || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CourseSidebar

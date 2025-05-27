import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStatsProps {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  approvedCourses?: number
  pendingCourses?: number
}

export default function DashboardStats({
  totalCourses,
  totalStudents,
  totalRevenue,
  approvedCourses = 0,
  pendingCourses = 0,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-800 to-blue-700 text-white border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Total Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold">{totalCourses}</div>
            <div className="text-blue-200 text-sm pb-1">courses</div>
          </div>
          <p className="text-blue-200 text-sm mt-2">
            {approvedCourses} approved, {pendingCourses} pending
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold">{totalStudents}</div>
            <div className="text-indigo-200 text-sm pb-1">students</div>
          </div>
          <p className="text-indigo-200 text-sm mt-2">Active across multiple courses</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-800 to-purple-700 text-white border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          </div>
          <p className="text-purple-200 text-sm mt-2">From {totalStudents} enrollments</p>
        </CardContent>
      </Card>
    </div>
  )
}

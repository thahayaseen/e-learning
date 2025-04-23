import { Suspense } from "react"
import CourseViewContainer from "../user/course/course-view-container"
import { Skeleton } from "../ui/skeleton"
import { useParams } from "next/navigation"
export default function CoursePage() {
  const params=useParams()
  return (
    <Suspense fallback={<CourseViewSkeleton />}>
      <CourseViewContainer id={params.id} />
    </Suspense>
  )
}

function CourseViewSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
